import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findFirst({
    where: { id: params.id, isActive: true }
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json(serializeProduct(product));
}
