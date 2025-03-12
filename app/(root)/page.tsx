import { Container, Title, ProductsGroupList, TopBar} from "@/shared/components/shared"
import { prisma } from "@/prisma/prisma-client";

export default async function Home() {
  const categories = await prisma.category.findMany({
    include: {
      products: true,
    },
  });

    const availableCategories = categories.filter((category) => 
      category.products.length > 0 && 
      category.products.some(product => product.isAvailable)
    );
  
    return(
     <>
      <Container className="mt-5">
        <Title text="Все блюда" size="lg" className="font-extrabold"/>
      </Container>
      <TopBar categories={availableCategories}/>

  <Container className="md-10 pb-14">
    <div className="flex gap-[60px]">
      {/* Список товаров */}
      <div className="flex-1">
        <div className="flex flex-col gap-16"> 
        {availableCategories.map((category) => (
                    <ProductsGroupList
                      key={category.id}
                      title={category.name}
                      items={category.products}
                      categoryId={category.id}
                    />
                  ),
              )}
       </div>
     </div>
    </div>
  </Container>
  </>
  );
}
