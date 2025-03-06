import { Container, Title, Categories, SortPopup, ProductCard, ProductsGroupList} from "@/components/shared"
import { TopBar } from "@/components/shared/top-bar"

export default function Home() {
  return <>
  <Container className="mt-5">
    <Title text="Все блюда" size="lg" className="font-extrabold"/>
  </Container>
  <TopBar/>

  <Container className="md-10 pb-14">
    <div className="flex gap-[60px]">
      {/* Список товаров */}
      <div className="flex-1">
        <div className="flex flex-col gap-16">
          <ProductsGroupList 
            title={"Супы"} 
            items={[
            {
              id: 1,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 2,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 3,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 4,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 5,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },

           ]}
          categoryId={1}
          />
          <ProductsGroupList 
            title={"Второе"} 
            items={[
            {
              id: 1,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 2,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 3,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 4,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 5,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 6,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 7,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 8,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 9,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
            {
              id: 10,
              name: "Борщ",
              imageUrl: "/images/items/Борщ.png",
              price: 350,
              items: [{price: 350}],
            },
           ]}
          categoryId={2}
          />
          {/*<ProductCard id={0} name={'Картофель по-деревенски'} price={550} imageUrl={'Картофель по-деревенски.png'}/>*/}
       </div>
     </div>
    </div>
  </Container>
  </>
}
