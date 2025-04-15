import { Container, Title, ProductsGroupList, TopBar } from "@/shared/components/shared"
import { prisma } from "@/prisma/prisma-client";
import { VerifyToastHandler } from "@/shared/components/shared/verify-toast-handler";
import { Suspense } from "react";

export default async function Home() {
  const categories = await prisma.category.findMany({
    orderBy: {
      id: 'asc',
    },
    include: {
      products: {
        orderBy: {
          id: 'asc',
        },
      },
    },
  });

  const availableCategories = categories.filter((category) =>
    category.products.length > 0 &&
    category.products.some(product => product.isAvailable) &&
    category.isAvailable
  );

  return (
    <>
    <Suspense fallback={null}><VerifyToastHandler /></Suspense>
      <Container className="mt-1 sm:mt-5">
        <Title text="Все блюда" size="lg" className="font-extrabold" />
      </Container>
      <TopBar categories={availableCategories} />

      <Container className="mt-4 sm:mt-10 pb-10 sm:pb-14">
        <div className="flex gap-6 sm:gap-[60px]">
          {/* Список товаров */}
          <div className="flex-1">
            <div className="flex flex-col gap-8 sm:gap-16">
              {availableCategories.map((category) => (
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
