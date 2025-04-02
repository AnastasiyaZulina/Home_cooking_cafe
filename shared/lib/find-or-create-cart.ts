// shared/lib/find-or-create-cart.ts
import { prisma } from "@/prisma/prisma-client";
import { User } from "next-auth";
import crypto from "crypto";
import { Cart } from "@prisma/client";

export const findOrCreateCart = async (user?: User, token?: string) => {
  // Для авторизованного пользователя
  if (user?.id) {
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: true }
      });
    }
    return cart;
  }

  // Для гостя: создаем новый токен если не передан
  let newToken = token;
  if (!newToken) {
    newToken = crypto.randomUUID();
  }

  let cart = await prisma.cart.findUnique({
    where: { token: newToken },
    include: { items: true }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { token: newToken },
      include: { items: true }
    });
  }

  return {
    ...cart,
    token: newToken // Гарантируем что token всегда string для гостей
  } as Cart & { token: string }; // Явное указание типа
};