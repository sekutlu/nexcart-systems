import { NextRequest } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const [products, orders, users, pending, salesAgg] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ _sum: { total: true } }),
    ]);
    const sales = Number(salesAgg._sum.total ?? 0);
    return Response.json({ products, orders, users, pending, sales });
  } catch (error) {
    return jsonError(error);
  }
}
