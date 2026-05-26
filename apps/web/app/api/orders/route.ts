import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { jsonError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" }
    });

    return Response.json(
      orders.map((order) => ({
        ...order,
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
          product: { ...item.product, price: Number(item.product.price) }
        }))
      }))
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = cartItems.reduce(
      (sum, item) => sum.add(item.product.price.mul(item.quantity)),
      new Prisma.Decimal(0)
    );

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: { items: true }
      });

      await tx.cartItem.deleteMany({ where: { userId: user.id } });
      return createdOrder;
    });

    return Response.json(
      {
        ...order,
        total: Number(order.total),
        items: order.items.map((item) => ({ ...item, price: Number(item.price) }))
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
