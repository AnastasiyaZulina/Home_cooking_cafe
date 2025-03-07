import {Prisma, PrismaClient } from '@prisma/client'
import { hashSync } from 'bcrypt';
const prisma = new PrismaClient()

async function up() {
    await prisma.user.createMany({
        data: [
            {
                fullName: 'User',
                email: 'user@test.com',
                password: hashSync('password', 10),
                verified: new Date(),
                role: 'USER',
            },
            {
                fullName: 'Admin',
                email: 'admin@test.ru',
                password: hashSync('password2', 10),
                verified: new Date(),
                role: 'ADMIN',
            },
        ]
    });

    await prisma.category.createMany({
        data: [
            { name: 'Супы' },
            { name: 'Второе' },
            { name: 'Гарниры' },
            { name: 'Салаты' },
            { name: 'Завтраки' },
            { name: 'Закуски' },
            { name: 'Выпечка' },
            { name: 'Десерты' },
            { name: 'Напитки' }
        ]
    });

    await prisma.product.createMany({
        data: [
            {
                name: 'Борщ',
                description: 'Суп',
                image: '/images/items/Борщ.png',
                price: 100,
                categoryId: 1
            },
            {
                name: 'Щи',
                description: 'Суп',
                image: '/images/items/Борщ.png',
                price: 90,
                categoryId: 1
            },
            {
                name: 'Солянка',
                description: 'Суп',
                image: '/images/items/Борщ.png',
                price: 110,
                categoryId: 1
            },
            {
                name: 'Уха',
                description: 'Суп',
                image: '/images/items/Борщ.png',
                price: 120,
                categoryId: 1
            },
            {
                name: 'Грибной суп',
                description: 'Суп',
                image: '/images/items/Борщ.png',
                price: 95,
                categoryId: 1
            },
            {
                name: 'Котлеты',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 130,
                categoryId: 2
            },
            {
                name: 'Жаркое',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 150,
                categoryId: 2
            },
            {
                name: 'Тефтели',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 140,
                categoryId: 2
            },
            {
                name: 'Рыба жареная',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 160,
                categoryId: 2
            },
            {
                name: 'Голубцы',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 145,
                categoryId: 2
            },
            {
                name: 'Картофельное пюре',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 60,
                categoryId: 3
            },
            {
                name: 'Рис',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 50,
                categoryId: 3
            },
            {
                name: 'Гречка',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 55,
                categoryId: 3
            },
            {
                name: 'Макароны',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 45,
                categoryId: 3
            },
            {
                name: 'Овощи на пару',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 70,
                categoryId: 3
            },
            {
                name: 'Оливье',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 80,
                categoryId: 4
            },
            {
                name: 'Цезарь',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 120,
                categoryId: 4
            },
            {
                name: 'Греческий',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 110,
                categoryId: 4
            },
            {
                name: 'Крабовый',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 90,
                categoryId: 4
            },
            {
                name: 'Винегрет',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 70,
                categoryId: 4
            },
            {
                name: 'Яичница',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 60,
                categoryId: 5
            },
            {
                name: 'Омлет',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 70,
                categoryId: 5
            },
            {
                name: 'Каша овсяная',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 65,
                categoryId: 5
            },
            {
                name: 'Сырники',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 85,
                categoryId: 5
            },
            {
                name: 'Блины',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 75,
                categoryId: 5
            },
            {
                name: 'Бутерброды',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 50,
                categoryId: 6
            },
            {
                name: 'Нарезка мясная',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 160,
                categoryId: 6
            },
            {
                name: 'Нарезка сырная',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 150,
                categoryId: 6
            },
            {
                name: 'Оливки',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 80,
                categoryId: 6
            },
            {
                name: 'Маринованные грибы',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 90,
                categoryId: 6
            },
            {
                name: 'Пирожки с капустой',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 40,
                categoryId: 7
            },
            {
                name: 'Пирожки с мясом',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 50,
                categoryId: 7
            },
            {
                name: 'Ватрушка',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 45,
                categoryId: 7
            },
            {
                name: 'Булочка с маком',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 35,
                categoryId: 7
            },
            {
                name: 'Круассан',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 55,
                categoryId: 7
            },
            {
                name: 'Торт Наполеон',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 120,
                categoryId: 8
            },
            {
                name: 'Чизкейк',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 130,
                categoryId: 8
            },
            {
                name: 'Тирамису',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 140,
                categoryId: 8
            },
            {
                name: 'Мороженое',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 80,
                categoryId: 8
            },
            {
                name: 'Пудинг',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 90,
                categoryId: 8
            },
            {
                name: 'Чай',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 30,
                categoryId: 9
            },
            {
                name: 'Кофе',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 40,
                categoryId: 9
            },
            {
                name: 'Сок',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 45,
                categoryId: 9
            },
            {
                name: 'Компот',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 35,
                categoryId: 9
            },
            {
                name: 'Морс',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 40,
                categoryId: 9
            }
        ]
    });


    await prisma.cart.createMany({
        data: [
        {
            userId: 1,
            totalAmount: 0,
            token: '1111',
        },
        {
            userId: 2,
            totalAmount: 0,
            token: '2222',
        },
        ],
    });

    await prisma.cartItem.createMany({
        data: [
        {
        productId: 1,
        cartId: 1,
        quantity: 2,
        },
        {
         productId: 32,
        cartId: 1,
        quantity: 5,
        },
        ],
    });
}

async function down() {
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Cart" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "CartItem" RESTART IDENTITY CASCADE`;
}

async function main() {
    try{
        await down();
        await up();
    } catch(err) {
        console.error(err)
    }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })