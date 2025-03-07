import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
const products = await prisma.product.findMany({});

return NextResponse.json(products);
}