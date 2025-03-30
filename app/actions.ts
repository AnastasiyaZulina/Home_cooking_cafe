'use server';
import { CheckoutFormValues } from '@/shared/constants';
import { prisma } from '@/prisma/prisma-client';
import { cookies } from 'next/headers';
import { OrderStatus, Prisma } from '@prisma/client';
import { createPayment, sendEmail } from '@/shared/lib';
import { hashSync } from 'bcrypt';
import { getUserSession } from '@/shared/lib/get-user-session';
import { OrderCreatedTemplate, PayOrderTemplate, VerificationUserTemplate } from '@/shared/components';

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
  await prisma.cart.update({
    where: {
      id: userCart.id,
    },
    data: {
      totalAmount: 0,
    },
  });

  await prisma.cartItem.deleteMany({
    where: {
      cartId: userCart.id,
    },
  });
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

    for (const item of userCart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(`Not enough stock for product ${product.name}. Available: ${product.stockQuantity}, requested: ${item.quantity}`);
      }
    }


    /*Создаем заказ*/
    const order = await prisma.order.create({
      data: {
        userId: session?.id ? Number(session.id) : null,
        token: cartToken,
        fullName: data.firstname + ' ' + data.lastname,
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
    throw new Error('Failed to create order');
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
        fullName: body.fullName,
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
        fullName: body.fullName,
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