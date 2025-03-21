import {Prisma, PrismaClient } from '@prisma/client'
import { hashSync } from 'bcrypt';
const prisma = new PrismaClient()

async function up() {
    await prisma.user.createMany({
        data: [
            {
                fullName: 'User',
                email: 'user@test.com',
                password: hashSync('111111', 10),
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
                categoryId: 1,
                weight: 300,
                eValue: 250,
                isAvailable: false
            },
            {
                name: 'Щи',
                description: 'Суп',
                image: '/images/items/Борщ.png',
                price: 90,
                categoryId: 1,
                weight: 300,
                eValue: 230,
                isAvailable: true
            },
            {
                name: 'Солянка',
                description: 'Суп',
                image: '/images/items/Борщ.png',
                price: 110,
                categoryId: 1,
                weight: 300,
                eValue: 280,
                isAvailable: true
            },
            {
                name: 'Уха',
                description: 'Суп',
                image: '/images/items/Борщ.png',
                price: 120,
                categoryId: 1,
                weight: 300,
                eValue: 220,
                isAvailable: true
            },
            {
                name: 'Грибной суп',
                description: 'Суп',
                image: '/images/items/Борщ.png',
                price: 95,
                categoryId: 1,
                weight: 300,
                eValue: 200,
                isAvailable: true
            },
            {
                name: 'Котлеты',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 130,
                categoryId: 2,
                weight: 200,
                eValue: 350,
                isAvailable: true
            },
            {
                name: 'Жаркое',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 150,
                categoryId: 2,
                weight: 250,
                eValue: 400,
                isAvailable: true
            },
            {
                name: 'Тефтели',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 140,
                categoryId: 2,
                weight: 200,
                eValue: 320,
                isAvailable: true
            },
            {
                name: 'Рыба жареная',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 160,
                categoryId: 2,
                weight: 180,
                eValue: 280,
                isAvailable: true
            },
            {
                name: 'Голубцы',
                description: 'Второе',
                image: '/images/items/Борщ.png',
                price: 145,
                categoryId: 2,
                weight: 250,
                eValue: 300,
                isAvailable: true
            },
            {
                name: 'Картофельное пюре',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 60,
                categoryId: 3,
                weight: 150,
                eValue: 180,
                isAvailable: true
            },
            {
                name: 'Рис',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 50,
                categoryId: 3,
                weight: 150,
                eValue: 200,
                isAvailable: true
            },
            {
                name: 'Гречка',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 55,
                categoryId: 3,
                weight: 150,
                eValue: 190,
                isAvailable: true
            },
            {
                name: 'Макароны',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 45,
                categoryId: 3,
                weight: 150,
                eValue: 210,
                isAvailable: true
            },
            {
                name: 'Овощи на пару',
                description: 'Гарнир',
                image: '/images/items/Борщ.png',
                price: 70,
                categoryId: 3,
                weight: 150,
                eValue: 100,
                isAvailable: true
            },
            {
                name: 'Оливье',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 80,
                categoryId: 4,
                weight: 150,
                eValue: 230,
                isAvailable: true
            },
            {
                name: 'Цезарь',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 120,
                categoryId: 4,
                weight: 150,
                eValue: 250,
                isAvailable: true
            },
            {
                name: 'Греческий',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 110,
                categoryId: 4,
                weight: 150,
                eValue: 180,
                isAvailable: true
            },
            {
                name: 'Крабовый',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 90,
                categoryId: 4,
                weight: 150,
                eValue: 200,
                isAvailable: true
            },
            {
                name: 'Винегрет',
                description: 'Салат',
                image: '/images/items/Борщ.png',
                price: 70,
                categoryId: 4,
                weight: 150,
                eValue: 160,
                isAvailable: true
            },
            {
                name: 'Яичница',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 60,
                categoryId: 5,
                weight: 150,
                eValue: 220,
                isAvailable: true
            },
            {
                name: 'Омлет',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 70,
                categoryId: 5,
                weight: 200,
                eValue: 250,
                isAvailable: true
            },
            {
                name: 'Каша овсяная',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 65,
                categoryId: 5,
                weight: 250,
                eValue: 210,
                isAvailable: true
            },
            {
                name: 'Сырники',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 85,
                categoryId: 5,
                weight: 200,
                eValue: 280,
                isAvailable: true
            },
            {
                name: 'Блины',
                description: 'Завтрак',
                image: '/images/items/Борщ.png',
                price: 75,
                categoryId: 5,
                weight: 200,
                eValue: 260,
                isAvailable: true
            },
            {
                name: 'Бутерброды',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 50,
                categoryId: 6,
                weight: 100,
                eValue: 250,
                isAvailable: true
            },
            {
                name: 'Нарезка мясная',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 160,
                categoryId: 6,
                weight: 150,
                eValue: 350,
                isAvailable: true
            },
            {
                name: 'Нарезка сырная',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 150,
                categoryId: 6,
                weight: 150,
                eValue: 400,
                isAvailable: true
            },
            {
                name: 'Оливки',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 80,
                categoryId: 6,
                weight: 100,
                eValue: 150,
                isAvailable: true
            },
            {
                name: 'Маринованные грибы',
                description: 'Закуска',
                image: '/images/items/Борщ.png',
                price: 90,
                categoryId: 6,
                weight: 100,
                eValue: 120,
                isAvailable: true
            },
            {
                name: 'Пирожки с капустой',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 40,
                categoryId: 7,
                weight: 75,
                eValue: 200,
                isAvailable: true
            },
            {
                name: 'Пирожки с мясом',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 50,
                categoryId: 7,
                weight: 75,
                eValue: 250,
                isAvailable: true
            },
            {
                name: 'Ватрушка',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 45,
                categoryId: 7,
                weight: 100,
                eValue: 220,
                isAvailable: false
            },
            {
                name: 'Булочка с маком',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 35,
                categoryId: 7,
                weight: 75,
                eValue: 230,
                isAvailable: false
            },
            {
                name: 'Круассан',
                description: 'Выпечка',
                image: '/images/items/Борщ.png',
                price: 55,
                categoryId: 7,
                weight: 85,
                eValue: 280,
                isAvailable: false
            },
            {
                name: 'Торт Наполеон',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 120,
                categoryId: 8,
                weight: 150,
                eValue: 380,
                isAvailable: false
            },
            {
                name: 'Чизкейк',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 130,
                categoryId: 8,
                weight: 150,
                eValue: 350,
                isAvailable: false
            },
            {
                name: 'Тирамису',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 140,
                categoryId: 8,
                weight: 150,
                eValue: 320,
                isAvailable: false
            },
            {
                name: 'Мороженое',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 80,
                categoryId: 8,
                weight: 100,
                eValue: 200,
                isAvailable: false
            },
            {
                name: 'Пудинг',
                description: 'Десерт',
                image: '/images/items/Борщ.png',
                price: 90,
                categoryId: 8,
                weight: 150,
                eValue: 280,
                isAvailable: false
            },
            {
                name: 'Чай',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 30,
                categoryId: 9,
                weight: 200,
                eValue: 0,
                isAvailable: true
            },
            {
                name: 'Кофе',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 40,
                categoryId: 9,
                weight: 200,
                eValue: 0,
                isAvailable: true
            },
            {
                name: 'Сок',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 45,
                categoryId: 9,
                weight: 200,
                eValue: 90,
                isAvailable: true
            },
            {
                name: 'Компот',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 35,
                categoryId: 9,
                weight: 200,
                eValue: 80,
                isAvailable: true
            },
            {
                name: 'Морс',
                description: 'Напиток',
                image: '/images/items/Борщ.png',
                price: 40,
                categoryId: 9,
                weight: 200,
                eValue: 70,
                isAvailable: true
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