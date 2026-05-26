import { NextRequest } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json(products.map(serializeProduct));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { name, description, price, imageUrl, stock } = await request.json();

    if (!name || !description || price === undefined) {
      return Response.json({ error: "Name, description, and price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        stock: Number(stock ?? 0)
      }
    });

    return Response.json(serializeProduct(product), { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
