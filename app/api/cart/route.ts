import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { findOrCreateCart } from "@/shared/lib/find-or-create-cart";
import { CreateCartItemValues } from "@/shared/services/dto/cart.dto";

export async function GET(req: NextRequest) {
    try {
      const token = req.cookies.get('cartToken')?.value;
  
      if (!token) {
        return NextResponse.json({ items: [] }); // Удаляем totalAmount
      }
  
      const userCart = await prisma.cart.findFirst({
        where: { token },
        include: { items: { include: { product: true } } }
      });
  
      return NextResponse.json(userCart || { items: [] });
    } catch (error) {
      console.error('[CART_GET] Server error', error);
      return NextResponse.json(
        { error: 'Не удалось получить корзину' },
        { status: 500 }
      );
    }
  }

export async function POST(req: NextRequest) {
    try {
        let token = req.cookies.get('cartToken')?.value;

        if (!token) {
            token = crypto.randomUUID();    
        }

        const userCart = await findOrCreateCart(token);
        const data = (await req.json()) as CreateCartItemValues;
        const quantity = data.quantity || 1; // Получаем количество из запроса

        const findCartItem = await prisma.cartItem.findFirst({
            where: {
                cartId: userCart.id,
                productId: data.productId
            },
        });

        if (findCartItem) {
            await prisma.cartItem.update({
                where: {
                    id: findCartItem.id,
                },
                data: {
                    quantity: findCartItem.quantity + quantity, // Добавляем нужное количество
                },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: userCart.id,
                    productId: data.productId,
                    quantity: quantity, // Устанавливаем переданное количество
                }
            });
        }

        const updatedUserCart = await prisma.cart.findFirst({
            where: { token },
            include: { items: { include: { product: true } } },
        });
        const resp = NextResponse.json(updatedUserCart);
        resp.cookies.set('cartToken', token); 
        return resp;

    } catch (error) {
        console.error('[CART_POST Server error]:', error);
        return NextResponse.json(
            { error: 'Не удалось создать корзину' },
            { status: 500 }
        );
    }
}