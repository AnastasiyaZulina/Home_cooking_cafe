import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { findOrCreateCart } from "@/shared/lib/find-or-create-cart";
import { CreateCartItemValues } from "@/shared/services/dto/cart.dto";
import { getUserSession } from "@/shared/lib/get-user-session";

export async function GET(req: NextRequest) {
    try {
      const user = await getUserSession();
      const token = req.cookies.get('cartToken')?.value;
  
      let cart = null;
  
      // Для авторизованных - приоритет
      if (user?.id) {
        cart = await prisma.cart.findUnique({
          where: { userId: user.id },
          include: { 
            items: { 
              include: { 
                product: true 
              } 
            } 
          }
        });
      }
  
      // Для гостей или если у пользователя нет корзины
      if (!cart && token) {
        cart = await prisma.cart.findUnique({
            where: { token },
            include: { 
              items: { 
                include: { 
                  product: true 
                } 
              } 
            }
          });
      }
  
      return NextResponse.json(cart || { items: [] });
  
    } catch (error) {
      console.error('[CART_GET] Error:', error);
      return NextResponse.json(
        { error: 'Ошибка получения корзины' },
        { status: 500 }
      );
    }
  }

// app/api/cart/route.ts
export async function POST(req: NextRequest) {
    try {
      const sessionUser = await getUserSession();
      const user = sessionUser ?? undefined;
      let token = req.cookies.get('cartToken')?.value;
  
      // Создаем или находим корзину (автоматически генерируем токен если нужно)
      const currentCart = await findOrCreateCart(user, token);
      
      // Обновляем токен если он был сгенерирован
      token = currentCart.token!;
  
      // Логика добавления товара
      const data = await req.json() as CreateCartItemValues;
      const quantity = data.quantity || 1;
  
      // Проверка существования товара
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { stockQuantity: true }
      });
  
      if (!product || product.stockQuantity < quantity) {
        return NextResponse.json(
          { error: 'Товар недоступен' },
          { status: 400 }
        );
      }
  
      // Обновление корзины в транзакции
      const updatedCart = await prisma.$transaction(async (tx) => {
        const existingItem = await tx.cartItem.findFirst({
          where: { cartId: currentCart.id, productId: data.productId }
        });
  
        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity }
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: currentCart.id,
              productId: data.productId,
              quantity
            }
          });
        }
  
        return tx.cart.findUnique({
          where: { id: currentCart.id },
          include: { items: { include: { product: true } } }
        });
      });
  
      // Устанавливаем токен в куки если это гость
      const response = NextResponse.json(updatedCart);
      if (!user?.id) {
        response.cookies.set('cartToken', token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });
      }
  
      return response;
  
    } catch (error) {
      console.error('[CART_POST] Error:', error);
      return NextResponse.json(
        { error: 'Ошибка обновления корзины' },
        { status: 500 }
      );
    }
  }