import { Container, Title} from "@/shared/components/shared"

export default async function Dashboard() {

  return (
    <>
      <Container className="mt-1 sm:mt-5">
        <Title text="Dashboard" size="lg" className="font-extrabold" />
      </Container>
    </>
  );
}
