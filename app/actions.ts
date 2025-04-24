'use server';
import { CheckoutFormValues } from '@/shared/constants';
import { prisma } from '@/prisma/prisma-client';
import { cookies } from 'next/headers';
import { OrderStatus, Prisma } from '@prisma/client';
import { createPayment, sendEmail } from '@/shared/lib';
import { hashSync } from 'bcrypt';
import { getUserSession } from '@/shared/lib/get-user-session';
import { VerificationUserTemplate } from '@/shared/components';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/constants/auth-options';
import * as bcrypt from 'bcrypt';
import { chooseAndSendEmail } from '@/shared/components/shared/email-templates/choose-and-send-email';
import { FeedbackWithUser } from '@/@types/feedback';

async function clearCart(cartId: number) {
  await prisma.cartItem.deleteMany({
    where: {
      cartId: cartId,
    },
  });
}

export async function validateCart() {
  const cookieStore = cookies();
  const cartToken = (await cookieStore).get('cartToken')?.value;

  const session = await getUserSession();
  const userCart = await prisma.cart.findFirst({
    include: {
      items: {
        include: { product: true },
      },
    },
    where: {
      OR: [
        { userId: session?.id ? Number(session.id) : undefined },
        { token: cartToken }
      ]
    },
  });

  if (!userCart || userCart.items.length === 0) {
    return { adjustments: [] };
  }

  const adjustments: Array<{
    type: 'removed' | 'reduced';
    productName: string;
    newQuantity?: number;
  }> = [];

  // Удаляем недоступные товары
  const unavailableItems = userCart.items.filter(item => !item.product.isAvailable);
  if (unavailableItems.length > 0) {
    await prisma.cartItem.deleteMany({
      where: { id: { in: unavailableItems.map(item => item.id) } }
    });

    unavailableItems.forEach(item => {
      adjustments.push({
        type: 'removed',
        productName: item.product.name
      });
    });
  }

  // Корректируем количество
  const remainingItems = await prisma.cartItem.findMany({
    where: { cartId: userCart.id },
    include: { product: true }
  });

  for (const item of remainingItems) {
    if (item.quantity > item.product.stockQuantity) {

      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: item.product.stockQuantity }
      });

      adjustments.push({
        type: 'reduced',
        productName: item.product.name,
        newQuantity: item.product.stockQuantity
      });
    }
  }

  return { adjustments };
}

export async function updateProductStock(cartId: number) {
  const userCart = await prisma.cart.findUnique({
    include: {
      user: true,
      items: {
        include: { product: true },
      },
    },
    where: { id: cartId },
  });

  /*Если корзина не найдена, возвращаем ошибку*/
  if (!userCart) {
    throw new Error('Cart not found');
  }

  /*Если корзина пустая, возвращаем ошибку*/
  if (userCart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  for (const item of userCart.items) {
    const updatedProduct = await prisma.product.update({
      where: { id: item.productId },
      data: {
        stockQuantity: {
          decrement: item.quantity
        },
        isAvailable: {
          // Устанавливаем isAvailable в false, если stockQuantity после обновления <= 0
          set: item.product.stockQuantity - item.quantity > 0
        }
      }
    });

    // Дополнительная проверка на отрицательный остаток (на всякий случай)
    if (updatedProduct.stockQuantity < 0) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          isAvailable: false
        }
      });
      console.warn(`Negative stock quantity for product ${item.productId}`);
    }
  }

  /*Очищаем корзину*/
  clearCart(userCart.id);
}

export async function createOrder(data: CheckoutFormValues) {
  try {
    const cookieStore = cookies();
    const cartToken = (await cookieStore).get('cartToken')?.value;
    
    const session = await getUserSession();

    if (data.bonusDelta !== 0 && !session) {
      throw new Error('Unauthorized bonus operation');
    }

    if (data.deliveryType === 'DELIVERY' && data.paymentMethod === 'OFFLINE') {
      throw new Error("Оплата при получении недоступна для доставки");
    }

    const userCart = await prisma.cart.findFirst({
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
      where: {
        OR: [
          { userId: session?.id ? Number(session.id) : undefined },
          { token: cartToken }
        ]
      },
    });

    if (!userCart) {
      throw new Error('Корзина не найдена');
    }

    /*Если корзина пустая, возвращаем ошибку*/
    if (userCart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const unavailableItems = userCart.items.filter(item => !item.product.isAvailable);

    if (unavailableItems.length > 0) {
      // Удаляем недоступные товары из корзины
      await prisma.cartItem.deleteMany({
        where: {
          id: {
            in: unavailableItems.map(item => item.id)
          }
        }
      });

      throw new Error(`Некоторые товары закончились и были удалены из корзины. Перезагрузка страницы...`);
    }

    for (const item of userCart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Продукт ${item.productId} не найден`);
      }

      if (product.stockQuantity < item.quantity) {
        // Автоматически уменьшаем количество до доступного
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { quantity: product.stockQuantity }
        });

        throw new Error(
          `Количество "${product.name}" уменьшено до ${product.stockQuantity} (максимально доступное). Перезагрузка страницы...`
        );
      }
    }

    /* Вычисляем сумму заказа */
    const totalAmount = userCart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    /*Создаем заказ*/
    const order = await prisma.order.create({
      data: {
        userId: session?.id ? Number(session.id) : null,
        name: data.firstname,
        email: data.email,
        phone: data.phone,
        address: data.deliveryType === 'DELIVERY' ? data.address : null,
        comment: data.comment || null,
        status: OrderStatus.PENDING,
        deliveryType: data.deliveryType,
        deliveryTime: data.deliveryTime,
        deliveryCost: data.deliveryPrice,
        paymentMethod: data.paymentMethod,
        bonusDelta: data.bonusDelta
      },
    });

    await prisma.orderItem.createMany({
      data: userCart.items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.product.name,
        productPrice: item.product.price,
        productQuantity: item.quantity,
      })),
    });

    updateProductStock(userCart.id);

    if (order.userId) {
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          bonusBalance: {
            increment: order.bonusDelta,
          },
        },
      });
    }

    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    
    if (!orderWithItems) {
      throw new Error('Order not found');
    }

    if (data.paymentMethod === 'OFFLINE') {
      chooseAndSendEmail(orderWithItems, totalAmount);
      return '/';
    }

    const paymentData = await createPayment({
      amount: totalAmount + data.deliveryPrice,
      orderId: order.id,
      description: 'Оплата заказа #' + order.id,
    });

    if (!paymentData) {
      throw new Error('Payment data not found');
    }

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentId: paymentData.id,
      },
    });

    const paymentUrl = paymentData.confirmation.confirmation_url;
    chooseAndSendEmail(orderWithItems, totalAmount, paymentUrl);

    return paymentUrl;
  } catch (err) {
    console.error('[CREATE_ORDER_ERROR]:', err);
    throw err;
  }
}

export async function updateUserInfo(data: {
  name: string;
  phone?: string | null;
  password?: string;
  currentPassword?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error('Не авторизован');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) throw new Error('Пользователь не найден');

  const updateData: Prisma.UserUpdateInput = {
    name: data.name,
    phone: data.phone,
  };

  // Если у пользователя есть пароль, проверяем текущий
  if (user.password) {
    if (!data.currentPassword) {
      throw new Error('Текущий пароль обязателен для внесения изменений');
    }
    const isValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValid) {
      throw new Error('Неверный текущий пароль');
    }
  }

  // Устанавливаем новый пароль (для OAuth или смены пароля)
  if (data.password) {
    updateData.password = hashSync(data.password, 10);
  }

  return await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });
}


export async function registerUser(body: Prisma.UserCreateInput) {
  try {
    if (!body.password) throw new Error('Нет пароля');
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (user) {
      if (!user.verified) {
        throw new Error('Почта не подтверждена');
      }

      throw new Error('Пользователь уже существует');
    }

    const createdUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashSync(body.password, 10),
      },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verificationCode.create({
      data: {
        code,
        userId: createdUser.id,
      },
    });

    await sendEmail(createdUser.email, 'Скатерть-самобранка / 📝 Подтверждение регистрации', Promise.resolve(VerificationUserTemplate({ code })));
  } catch (error) {
    console.log('Error [CREATE_USER]', error);
    throw error;
  }
}

export async function createFeedback(feedbackText: string) {
  try {
    const session = await getUserSession();

    if (!session?.id) {
      throw new Error('Для отправки отзыва необходимо авторизоваться');
    }

    const newFeedback = await prisma.feedback.create({
      data: {
        feedbackText,
        userId: Number(session.id),
        feedbackStatus: 'PENDING',
        isVisible: false
      }
    });

    return newFeedback;
  } catch (error) {
    console.error('[CREATE_FEEDBACK_ERROR]:', error);
    throw error;
  }
}

export async function getFeedbacks(): Promise<FeedbackWithUser[]> {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        isVisible: true,
        feedbackStatus: 'APPROVED'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return feedbacks as FeedbackWithUser[];
  } catch (error) {
    console.error('[GET_FEEDBACKS_ERROR]:', error);
    return [];
  }
}