import { Container, Title, ProductsGroupList, TopBar } from "@/shared/components"
import { prisma } from "@/prisma/prisma-client";
import { VerifyToastHandler } from "@/shared/components";
import { Suspense } from "react";

export default async function Home() {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: 'asc',
      },
      where: {
        isAvailable: true,
        products: {
          some: {
            isAvailable: true,
            stockQuantity: {
              gt: 0
            }
          }
        }
      },
      include: {
        products: {
          where: {
            isAvailable: true,
            stockQuantity: {
              gt: 0
            }
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

  return (
    <>
    <Suspense fallback={null}><VerifyToastHandler /></Suspense>
      <Container className="mt-1 sm:mt-5">
        <Title text="Все блюда" size="lg" className="font-extrabold" />
      </Container>
      <TopBar categories={categories} />

      <Container className="mt-4 sm:mt-10 pb-10 sm:pb-14">
        <div className="flex gap-6 sm:gap-[60px]">
          {/* Список товаров */}
          <div className="flex-1">
            <div className="flex flex-col gap-8 sm:gap-16">
              {categories.map((category) => (
                <ProductsGroupList
                  key={category.id}
                  title={category.name}
                  items={category.products}
                  categoryId={category.id}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
