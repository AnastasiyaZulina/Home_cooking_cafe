'use server';
import { CheckoutFormValues } from '@/shared/constants';
import { prisma } from '@/prisma/prisma-client';
import { cookies } from 'next/headers';
import { OrderStatus, Prisma } from '@prisma/client';
import { createPayment, sendEmail } from '@/shared/lib';
import { hashSync } from 'bcrypt';
import { getUserSession } from '@/shared/lib/get-user-session';
import { OrderCreatedTemplate, PayOrderTemplate, VerificationUserTemplate } from '@/shared/components';

async function clearCart(Cartid: number) {
  await prisma.cart.update({
    where: {
      id: Cartid,
    },
    data: {
      totalAmount: 0,
    },
  });

  await prisma.cartItem.deleteMany({
    where: {
      cartId: Cartid,
    },
  });
}

export async function validateCart() {
  const cookieStore = cookies();
  const cartToken = (await cookieStore).get('cartToken')?.value;

  if (!cartToken) return { adjustments: [] };

  const userCart = await prisma.cart.findFirst({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    where: { token: cartToken },
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

  // Обновляем общую сумму если были изменения
  if (adjustments.length > 0) {
    const newItems = await prisma.cartItem.findMany({
      where: { cartId: userCart.id },
      include: { product: true }
    });

    const newTotal = newItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity), 
      0
    );

    await prisma.cart.update({
      where: { id: userCart.id },
      data: { totalAmount: newTotal }
    });
  }

  return { adjustments };
}

export async function updateProductStock(cartToken: string) {
  const userCart = await prisma.cart.findFirst({
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    where: {
      token: cartToken,
    },
  });

  /*Если корзина не найдена, возвращаем ошибку*/
  if (userCart?.totalAmount === 0) {
    throw new Error('Cart is empty');
  }

  /*Если корзина пустая, возвращаем ошибку*/
  if (!userCart) {
    throw new Error('Cart not found');
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

    if (!cartToken) {
      throw new Error('Cart token not found');
    }
    const session = await getUserSession();

    if (data.bonusDelta !== 0 && !session) {
      throw new Error('Unauthorized bonus operation');
    }

    if (data.deliveryType === 'DELIVERY' && data.paymentMethod === 'OFFLINE') {
      throw new Error("Оплата при получении недоступна для доставки");
    }

    /*Находим корзину по токену*/
    const userCart = await prisma.cart.findFirst({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      where: {
        token: cartToken,
      },
    });

    /*Если корзина не найдена, возвращаем ошибку*/
    if (userCart?.totalAmount === 0) {
      throw new Error('Cart is empty');
    }

    /*Если корзина пустая, возвращаем ошибку*/
    if (!userCart) {
      throw new Error('Cart not found');
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

      // Обновляем общую сумму корзины
      const remainingItems = userCart.items.filter(item => item.product.isAvailable);
      const newTotal = remainingItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      await prisma.cart.update({
        where: { id: userCart.id },
        data: { totalAmount: newTotal }
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


    /*Создаем заказ*/
    const order = await prisma.order.create({
      data: {
        userId: session?.id ? Number(session.id) : null,
        token: cartToken,
        name: data.firstname + ' ' + data.lastname,
        email: data.email,
        phone: data.phone,
        address: data.deliveryType === 'DELIVERY' ? data.address : null,
        comment: data.comment || null,
        totalAmount: userCart.totalAmount,
        status: OrderStatus.PENDING,
        items: userCart.items,
        deliveryType: data.deliveryType,
        deliveryTime: data.deliveryTime,
        deliveryCost: data.deliveryPrice,
        paymentMethod: data.paymentMethod,
        bonusDelta: data.bonusDelta
      },
    });

    // Обновляем количество товаров на складе (только для OFFLINE оплаты)
    if (data.paymentMethod === 'OFFLINE') {

      updateProductStock(cartToken);

      await sendEmail(
        data.email,
        `Скатерть-самобранка | Заказ #${order.id} принят`,
        Promise.resolve(OrderCreatedTemplate({
          orderId: order.id,
        }))
      );
      return '/';
    }

    const paymentData = await createPayment({
      amount: order.totalAmount,
      orderId: order.id,
      cartToken: cartToken,
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

    await sendEmail(
      data.email,
      'Скатерть-самобранка | Оплатите заказ #' + order.id,
      Promise.resolve(PayOrderTemplate({
        orderId: order.id,
        totalPrice: order.totalAmount + data.deliveryPrice,
        paymentUrl
      })),
    );

    return paymentUrl;
  } catch (err) {
    console.error('[CREATE_ORDER_ERROR]:', err);
    throw err;
  }
}

export async function updateUserInfo(body: Prisma.UserUpdateInput) {
  try {
    const currentUser = await getUserSession();

    if (!currentUser) {
      throw new Error('Пользователь не найден');
    }

    const findUser = await prisma.user.findFirst({
      where: {
        id: Number(currentUser.id),
      },
    })

    await prisma.user.update({
      where: {
        id: Number(currentUser.id),
      },
      data: {
        name: body.name,
        email: body.email,
        password: body.password ? hashSync(body.password as string, 10) : findUser?.password,
      },
    });
  } catch (error) {
    console.log('Error [UPDATE_USER]', error);
    throw error;
  }
}


export async function registerUser(body: Prisma.UserCreateInput) {
  try {
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

    console.log(createdUser);
    await sendEmail(createdUser.email, 'Скатерть-самобранка / 📝 Подтверждение регистрации', Promise.resolve(VerificationUserTemplate({ code })));
  } catch (error) {
    console.log('Error [CREATE_USER]', error);
    throw error;
  }
}

export type FeedbackWithUser = {
  id: number;
  feedbackText: string;
  createdAt: Date;
  user: {
    name: string;
  };
};

// Добавьте эти функции в конец файла
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