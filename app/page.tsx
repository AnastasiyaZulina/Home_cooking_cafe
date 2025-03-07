import { Container, Title, ProductsGroupList, TopBar} from "@/components/shared"
import { prisma } from "@/prisma/prisma-client";

export default async function Home() {
  const categories = await prisma.category.findMany({
    include: {
      products: true,
    },
  });

  return(
   <>
  <Container className="mt-5">
    <Title text="Все блюда" size="lg" className="font-extrabold"/>
  </Container>
  <TopBar/>

  <Container className="md-10 pb-14">
    <div className="flex gap-[60px]">
      {/* Список товаров */}
      <div className="flex-1">
        <div className="flex flex-col gap-16"> 
        {categories.map(
                (category) =>
                  category.products.length > 0 && (
                    <ProductsGroupList
                      key={category.id}
                      title={category.name}
                      items={category.products}
                      categoryId={category.id}
                    />
                  ),
              )}
          {/*<ProductCard id={0} name={'Картофель по-деревенски'} price={550} image={'Картофель по-деревенски.png'}/>*/}
       </div>
     </div>
    </div>
  </Container>
  </>
  );
}
