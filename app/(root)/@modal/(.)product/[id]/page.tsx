import { prisma } from "@/prisma/prisma-client";
import { SeeProductModal } from "@/shared/components";
import { notFound} from "next/navigation";

export default async function ProductModalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
    });
  
    if (!product) {
      return notFound();
    }

    return <SeeProductModal product={product} />;
}
