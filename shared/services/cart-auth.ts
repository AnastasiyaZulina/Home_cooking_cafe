import { prisma } from "@/prisma/prisma-client";

export const handleCartOnAuth = async (userId: number, token?: string) => {
    if (!token) return null;
  
    return prisma.$transaction(async (tx) => {
      const guestCart = await tx.cart.findUnique({
        where: { token },
        include: { items: true }
      });
  
      if (!guestCart) return null;
  
      // Удаляем все существующие корзины пользователя
      await tx.cart.deleteMany({ 
        where: { userId } 
      });
      if (!userId) {console.log('services/cart-auth.ts, нет userId!'); return null; }
      return tx.cart.update({
        where: { id: guestCart.id },
        data: {
          userId,
          token: null
        },
        include: { items: true }
      });
    });
  };