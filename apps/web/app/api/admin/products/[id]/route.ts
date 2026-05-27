import { NextRequest } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const { name, description, price, imageUrl, stock, category, isActive } = await request.json();

    if (!name || !description || price === undefined) {
      return Response.json({ error: "Name, description, and price are required" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        imageUrl: imageUrl ?? null,
        stock: Number(stock ?? 0),
        category: category ?? "",
        isActive: isActive ?? true,
      },
    });

    return Response.json(serializeProduct(product));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
