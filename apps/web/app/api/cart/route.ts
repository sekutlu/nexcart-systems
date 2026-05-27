import { NextRequest } from "next/server";
import { jsonError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// In-memory fallback cart (per-process, resets on restart — acceptable for demo)
const memCart: Record<string, { productId: string; quantity: number; name: string; price: number; stock: number }[]> = {};

function memGet(userId: string) { return memCart[userId] ?? []; }
function memSet(userId: string, items: typeof memCart[string]) { memCart[userId] = items; }

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    try {
      const items = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });
      return Response.json(
        items.map((i: any) => ({ ...i, product: { ...i.product, price: Number(i.product.price) } }))
      );
    } catch {
      // DB down — return in-memory cart
      return Response.json(
        memGet(user.id).map((i, idx) => ({
          id: `mem-${idx}`,
          productId: i.productId,
          quantity: i.quantity,
          product: { id: i.productId, name: i.name, price: i.price, stock: i.stock, imageUrl: null, category: "" },
        }))
      );
    }
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { productId, quantity = 1, name = "Product", price = 0, stock = 99 } = await request.json();
    if (!productId) return Response.json({ error: "productId is required" }, { status: 400 });

    try {
      const item = await prisma.cartItem.upsert({
        where: { userId_productId: { userId: user.id, productId } },
        update: { quantity: { increment: quantity } },
        create: { userId: user.id, productId, quantity },
        include: { product: true },
      });
      return Response.json({ ...item, product: { ...item.product, price: Number(item.product.price) } });
    } catch {
      // DB down — use in-memory cart
      const cart = memGet(user.id);
      const existing = cart.find(i => i.productId === productId);
      if (existing) existing.quantity += quantity;
      else cart.push({ productId, quantity, name, price, stock });
      memSet(user.id, cart);
      const item = cart.find(i => i.productId === productId)!;
      return Response.json({
        id: `mem-${productId}`, productId, quantity: item.quantity,
        product: { id: productId, name: item.name, price: item.price, stock: item.stock, imageUrl: null, category: "" },
      });
    }
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { productId, quantity } = await request.json();
    if (!productId || quantity === undefined) return Response.json({ error: "productId and quantity required" }, { status: 400 });
    if (quantity < 1) return Response.json({ error: "Quantity must be at least 1" }, { status: 400 });

    try {
      const item = await prisma.cartItem.update({
        where: { userId_productId: { userId: user.id, productId } },
        data: { quantity },
        include: { product: true },
      });
      return Response.json({ ...item, product: { ...item.product, price: Number(item.product.price) } });
    } catch {
      const cart = memGet(user.id);
      const item = cart.find(i => i.productId === productId);
      if (item) item.quantity = quantity;
      memSet(user.id, cart);
      return Response.json({ productId, quantity });
    }
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { productId } = await request.json();
    if (!productId) return Response.json({ error: "productId is required" }, { status: 400 });

    try {
      await prisma.cartItem.delete({ where: { userId_productId: { userId: user.id, productId } } });
    } catch {
      memSet(user.id, memGet(user.id).filter(i => i.productId !== productId));
    }
    return Response.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
