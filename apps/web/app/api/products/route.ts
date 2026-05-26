import { serializeProduct } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });

  return Response.json(products.map(serializeProduct));
}
