import { NextRequest } from "next/server";
import { jsonError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });

    return Response.json(
      items.map((item) => ({
        ...item,
        product: { ...item.product, price: Number(item.product.price) }
      }))
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return Response.json({ error: "productId is required" }, { status: 400 });
    }

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId: user.id, productId, quantity },
      include: { product: true }
    });

    return Response.json({
      ...item,
      product: { ...item.product, price: Number(item.product.price) }
    });
  } catch (error) {
    return jsonError(error);
  }
}
