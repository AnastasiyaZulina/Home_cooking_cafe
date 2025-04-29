import {PrismaClient } from '@prisma/client'
import { hashSync } from 'bcrypt';
const prisma = new PrismaClient()

async function up() {
    await prisma.user.createMany({
        data: [
            {
                name: 'SuperAdmin',
                email: 'nzulina2016@mail.com',
                password: hashSync('199School199', 10),
                verified: new Date(),
                role: 'SUPERADMIN',
            },
            {
                name: 'Admin',
                email: 'nzulina2016@gmail.ru',
                password: hashSync('199School199', 10),
                verified: new Date(),
                role: 'ADMIN',
            },
            {
                name: 'Тест',
                email: 'nzulina2016@bk.ru',
                password: hashSync('199School199', 10),
                verified: new Date(),
                role: 'USER',
            },
        ]
    });

    await prisma.category.createMany({
        data: [
            { name: 'Завтрак' },
            { name: 'Салаты' },
            { name: 'Супы' },
            { name: 'Обед' },
            { name: 'Гарниры' },
            { name: 'Хлеб' },
            { name: 'Соусы' },
        ]
    });

    await prisma.product.createMany({
        data: [
            {
                name: 'Шаурма',
                description: 'Состав: окорочок замаринованный в соусе и обжаренный, капуста белокочанная, корейская морковь, огурец свежий, помидор свежий, сыр, лаваш',
                image: '/images/items/product-1.jpg',
                price: 280,
                categoryId: 1,
                weight: 300,
                eValue: 750,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Каша рисовая с маслом',
                description: 'Состав: крупа рисовая, молоко, соль сахар, масло сливочное',
                image: '/images/items/product-2.jpg',
                price: 65,
                categoryId: 1,
                weight: 180,
                eValue: 230,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Сэндвич с ветчиной и сыром',
                description: 'Состав: тост, соус (майонез, аджика), пекинская капуста, ветчина, сыр',
                image: '/images/items/product-3.jpg',
                price: 180,
                categoryId: 1,
                weight: 140,
                eValue: 320,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Гамбургер с котлетой',
                description: 'Состав: булочка, соус Гамбургер, лист салата, котлета куриная, помидор свежий, огурчик консервированный, сыр',
                image: '/images/items/product-4.jpg',
                price: 230,
                categoryId: 1,
                weight: 160,
                eValue: 450,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Гамбургер с курицей',
                description: 'Состав: булочка, соус Гамбургер, лист салата, помидор свежий, филе куриное, огурчик консервированный, сыр',
                image: '/images/items/product-5.jpg',
                price: 195,
                categoryId: 1,
                weight: 150,
                eValue: 380,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Сэндвич с котлетой',
                description: 'Состав: тост, соус Гамбургер, пекинская капуста, котлета куриная, сыр ломтик',
                image: '/images/items/product-6.jpg',
                price: 230,
                categoryId: 1,
                weight: 180,
                eValue: 420,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Блинчик с яблоком',
                description: 'Состав: блинчик (мука, молоко, яйцо, сахар, соль, масло растительное), фарш: яблоко, сахар',
                image: '/images/items/product-7.jpg',
                price: 65,
                categoryId: 1,
                weight: 100,
                eValue: 180,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Блинчик с творогом',
                description: 'Состав: блинчик (мука, молоко, яйцо, сахар, соль, масло растительное), фарш: творог, яйцо, мука, ванилин, сахар',
                image: '/images/items/product-8.jpg',
                price: 65,
                categoryId: 1,
                weight: 100,
                eValue: 220,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Блинчик с мясом и рисом',
                description: 'Состав: блинчик (мука, молоко, яйцо, сахар, соль, масло растительное), фарш: свинина, говядина, лук, рис, соль, специи, яйцо куриное',
                image: '/images/items/product-9.jpg',
                price: 75,
                categoryId: 1,
                weight: 100,
                eValue: 250,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Блинчик с ветчиной и сыром',
                description: 'Состав: блинчик (мука, молоко, яйцо, сахар, соль, масло растительное), фарш: ветчина, сыр, яйцо, специи',
                image: '/images/items/product-10.jpg',
                price: 75,
                categoryId: 1,
                weight: 100,
                eValue: 280,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Сэндвич с курицей и сыром',
                description: 'Состав: тост, соус Гамбургер, пекинская капуста, обжаренное куриное филе, сыр ломтик',
                image: '/images/items/product-11.jpg',
                price: 190,
                categoryId: 1,
                weight: 140,
                eValue: 350,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Кесадия с мясом',
                description: 'Состав: свинина, говядина, лук репчатый, специи (орегано, базилик, аджика, перец черный молотый), томатная паста, помидор, масло растительное, сыр, лепешка тортилья (мука, вода, масло растительное, сахар, соль, разрыхлитель, эмульгаторы)',
                image: '/images/items/product-12.jpg',
                price: 185,
                categoryId: 1,
                weight: 180,
                eValue: 400,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Горячий бутерброд с колбасой и помидором',
                description: 'Состав: сервелат, помидор, майонез, сыр, хлеб (батон)',
                image: '/images/items/product-13.jpg',
                price: 78,
                categoryId: 1,
                weight: 70,
                eValue: 220,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Бутерброд с горбушей',
                description: 'Состав: батон, горбуша слабосоленая, масло сливочное, зелень',
                image: '/images/items/product-14.jpg',
                price: 78,
                categoryId: 1,
                weight: 50,
                eValue: 180,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Блинчики 2 шт',
                description: 'Состав: яйцо, молоко, мука, сахар, соль, масло растительное',
                image: '/images/items/product-15.jpg',
                price: 65,
                categoryId: 1,
                weight: 100,
                eValue: 240,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Сосиска отварная или обжаренная',
                description: '',
                image: '/images/items/product-16.jpg',
                price: 60,
                categoryId: 1,
                weight: 60,
                eValue: 150,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Биг Салат овощной с моцареллой, кунжутом',
                description: 'Состав: лист салата, пекинская капуста, помидор, огурец, сыр Моцарелла (шарики), заправка (растительное масло, бальзамический уксус, горчица, мед, соль, орегано), кунжут, микрозелень',
                image: '/images/items/product-17.jpg',
                price: 165,
                categoryId: 2,
                weight: 135,
                eValue: 180,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Биг Салат "Овощной Бум"',
                description: 'Состав: лист салата, помидор черри, огурец свежий, сельдерей стебель, сыр "Фета", заправка на основе растительного масла со специями, бальзамический соус.',
                image: '/images/items/product-18.jpg',
                price: 175,
                categoryId: 2,
                weight: 160,
                eValue: 200,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Борщ с говядиной и чесночными гренками',
                description: 'Состав: бульон говяжий, говядина, картофель, лук, морковь, капуста б/х, свекла, томатная паста, уксус, соль, сахар, перец черный молотый, лавровый лист, чеснок. Подаётся со сметаной, зеленью, чесночными гренками.',
                image: '/images/items/product-19.jpg',
                price: 249,
                categoryId: 3,
                weight: 350,
                eValue: 280,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Борщ с говядиной и салом',
                description: 'Состав: бульон говяжий, говядина, картофель, лук, морковь, капуста б/х, свекла, томатная паста, уксус, соль, сахар, перец черный молотый, лавровый лист, чеснок. Подаётся со сметаной, зеленью, салом. 40 гр - Сало солёное / Сало Бабушкины рецепты.',
                image: '/images/items/product-20.jpg',
                price: 249,
                categoryId: 3,
                weight: 350,
                eValue: 350,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Борщ с говядиной',
                description: 'Состав: бульон говяжий, говядина, картофель, лук, морковь, капуста б/х, свекла, томатная паста, уксус, соль, сахар, перец черный молотый, лавровый лист, чеснок. Подаётся со сметаной и зеленью.',
                image: '/images/items/product-21.jpg',
                price: 135,
                categoryId: 3,
                weight: 350,
                eValue: 250,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Солянка домашняя',
                description: 'Состав: бульон из копченостей, сервелат, свинина, курица копченая, сосиски, картофель, огурец консервированный, томатная паста, лук, лимон, маслины, соль, перец черный молотый, лавровый лист. Подаётся со сметаной и зеленью.',
                image: '/images/items/product-22.jpg',
                price: 135,
                categoryId: 3,
                weight: 250,
                eValue: 320,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Филе куриное, запеченное с помидором',
                description: 'Состав: филе куриное, соль, перец черный молотый, приправа для курицы, помидор, сыр, масло растительное, зелень',
                image: '/images/items/product-23.jpg',
                price: 190,
                categoryId: 4,
                weight: 100,
                eValue: 220,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Стейк из свинины',
                description: 'Состав: свинина шея, соль, перец черный молотый, приправа для мяса, соевый соус, масло растительное, лук маринованный (соль, сахар, уксус, масло растительное), зелень',
                image: '/images/items/product-24.jpg',
                price: 249,
                categoryId: 4,
                weight: 120,
                eValue: 350,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Буженина',
                description: 'Состав: свинина, соль, перец черный молотый, чеснок, масло растительное, лавровый лист, аджика, зелень.',
                image: '/images/items/product-25.jpg',
                price: 249,
                categoryId: 4,
                weight: 120,
                eValue: 380,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Минтай с сыром и морковью под майонезом',
                description: 'Состав: минтай, соль, специи, лук, морковь, майонез, сыр, масло растительное',
                image: '/images/items/product-26.jpg',
                price: 195,
                categoryId: 4,
                weight: 140,
                eValue: 280,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Горбуша с помидором под майонезом',
                description: 'Состав: филе горбуши, приправа для рыбы, соль, перец, помидор, майонез, сыр, масло растительное, зелень',
                image: '/images/items/product-27.jpg',
                price: 225,
                categoryId: 4,
                weight: 130,
                eValue: 320,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Каша гречневая',
                description: 'Состав: крупа гречневая, соль, масло растительное, масло сливочное',
                image: '/images/items/product-28.jpg',
                price: 70,
                categoryId: 5,
                weight: 180,
                eValue: 200,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Картофельные дольки',
                description: 'Состав: картофель, соль, перец черный молотый, масло растительное, зелень',
                image: '/images/items/product-29.jpg',
                price: 95,
                categoryId: 5,
                weight: 180,
                eValue: 250,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Тост',
                description: 'Состав: хлеб пшеничный тостовый',
                image: '/images/items/product-30.jpg',
                price: 95,
                categoryId: 6,
                weight: 35,
                eValue: 80,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Хлеб Черный',
                description: '',
                image: '/images/items/product-31.jpg',
                price: 25,
                categoryId: 6,
                weight: 25,
                eValue: 60,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Майонез',
                description: '',
                image: '/images/items/product-32.jpg',
                price: 15,
                categoryId: 7,
                weight: 20,
                eValue: 140,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Соус Сырный',
                description: 'Состав: сыр, соус майонез, чеснок, зелень',
                image: '/images/items/product-33.jpg',
                price: 25,
                categoryId: 7,
                weight: 30,
                eValue: 180,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Горчица',
                description: 'Состав: горчица порошок, соль, сахар, уксус, растительное масло',
                image: '/images/items/product-34.jpg',
                price: 10,
                categoryId: 7,
                weight: 10,
                eValue: 50,
                stockQuantity: 5,
                isAvailable: true
            },
            {
                name: 'Сметана',
                description: '',
                image: '/images/items/product-35.jpg',
                price: 10,
                categoryId: 7,
                weight: 20,
                eValue: 60,
                stockQuantity: 5,
                isAvailable: true
            },
        ]
    });
    await prisma.feedback.createMany({
        data: [
            {
                userId: 3,
                feedbackText: 'Отличная шаурма, всем рекомендую! Быстро, вкусно, недорого.',
                feedbackStatus: 'APPROVED',
                isVisible: true
            },
            {
                userId: 3,
                feedbackText: 'Борщ мог бы быть повкуснее, мало мяса.',
                feedbackStatus: 'APPROVED',
                isVisible: true
            },
            {
                userId: 3,
                feedbackText: 'Салаты свежие, но порции небольшие.',
                feedbackStatus: 'PENDING'
            }
        ]
    });
    const orders = await prisma.order.createMany({
        data: [
            {
                userId: 3,
                status: 'COMPLETED',
                paymentMethod: 'ONLINE',
                bonusDelta: 50,
                deliveryType: 'DELIVERY',
                deliveryTime: new Date,
                deliveryCost: 150,
                name: 'Владимир',
                address: 'ул. Ленина, 10, кв. 5',
                email: 'viktor.bahamut@bk.ru',
                phone: '+79123456789',
                comment: 'Позвонить за 10 минут до доставки'
            },
            {
                userId: 3,
                status: 'DELIVERY',
                paymentMethod: 'OFFLINE',
                bonusDelta: 0,
                deliveryType: 'PICKUP',
                deliveryTime: new Date,
                name: 'Владимир',
                email: 'viktor.bahamut@bk.ru',
                phone: '+79123456789'
            }
        ]
    });

    // Получаем ID созданных заказов
    const createdOrders = await prisma.order.findMany({
        where: {
            userId: 3
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 2
    });

    // Получаем некоторые продукты для заказов
    const products = await prisma.product.findMany({
        where: {
            id: {
                in: [1, 2, 16, 22]
            }
        }
    });

    // Создаем элементы заказов
    await prisma.orderItem.createMany({
        data: [
            // Первый заказ
            {
                orderId: createdOrders[0].id,
                productId: products[0].id, // Шаурма
                productName: products[0].name,
                productQuantity: 2,
                productPrice: products[0].price
            },
            {
                orderId: createdOrders[0].id,
                productId: products[1].id, // Каша рисовая
                productName: products[1].name,
                productQuantity: 1,
                productPrice: products[1].price
            },
            // Второй заказ
            {
                orderId: createdOrders[1].id,
                productId: products[2].id, // Биг Салат
                productName: products[2].name,
                productQuantity: 1,
                productPrice: products[2].price
            },
            {
                orderId: createdOrders[1].id,
                productId: products[3].id, // Филе куриное
                productName: products[3].name,
                productQuantity: 1,
                productPrice: products[3].price
            }
        ]
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