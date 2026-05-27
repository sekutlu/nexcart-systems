import { NextRequest } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return Response.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user:  { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    return Response.json({ ...order, total: Number(order.total) });
  } catch (error) {
    return jsonError(error);
  }
}
