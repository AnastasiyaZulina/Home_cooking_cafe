import { prisma } from "@/prisma/prisma-client";
import { findOrCreateCart } from "@/shared/lib/find-or-create-cart";
import { getUserSession } from "@/shared/lib/get-user-session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
      const sessionUser = await getUserSession();
      const user = sessionUser ?? undefined;
      let token = req.cookies.get('cartToken')?.value;
  
      const currentCart = await findOrCreateCart(user, token);
      token = currentCart.token!;
  
      const data = await req.json() as Array<{ productId: number, quantity: number }>;
      const productIds = data.map(i => i.productId);
  
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, isAvailable: true, stockQuantity: true }
      });
  
      const removed: { name: string; }[] = [];
      const adjusted: { name: string; originalQty: number; newQty: number; }[] = [];
      const success: { name: string; }[] = [];
  
      await prisma.$transaction(async (tx) => {
        for (const item of data) {
          const product = products.find(p => p.id === item.productId);
          if (!product || !product.isAvailable) {
            removed.push({ name: product?.name ?? 'Неизвестный товар' });
            continue;
          }
  
          const quantityToAdd = Math.min(item.quantity, product.stockQuantity);
          if (quantityToAdd < item.quantity) {
            adjusted.push({
              name: product.name,
              originalQty: item.quantity,
              newQty: quantityToAdd
            });
          }
  
          const existingItem = await tx.cartItem.findFirst({
            where: { cartId: currentCart.id, productId: item.productId }
          });
  
          if (existingItem) {
            await tx.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: existingItem.quantity + quantityToAdd }
            });
          } else {
            await tx.cartItem.create({
              data: {
                cartId: currentCart.id,
                productId: item.productId,
                quantity: quantityToAdd
              }
            });
          }
  
          success.push({ name: product.name });
        }
      });
  
      const updatedCart = await prisma.cart.findUnique({
        where: { id: currentCart.id },
        include: {
          items: {
            include: { product: true }
          }
        }
      });
  
      const response = NextResponse.json({
        cart: updatedCart,
        success,
        removed,
        adjusted
      });
  
      if (!user?.id) {
        response.cookies.set('cartToken', token);
      }
  
      return response;
    } catch (error) {
      console.error('[CART_REPEAT_ORDER_POST]', error);
      return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
    }
  }
  