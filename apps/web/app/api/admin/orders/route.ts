import { NextRequest } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user:  { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });
    return Response.json(orders.map(o => ({ ...o, total: Number(o.total) })));
  } catch (error) {
    return jsonError(error);
  }
}
