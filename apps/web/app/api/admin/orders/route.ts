import { NextRequest } from "next/server";
import { jsonError, requireDelivery } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEMO_ADMIN_ORDERS = [
  {
    id: "demo-ord-001", status: "PENDING", total: 34199,
    createdAt: new Date("2026-05-02").toISOString(),
    user: { name: "Thabo Mokoena", email: "thabo@mail.com" },
    items: [{ product: { name: "Dell XPS 15 Laptop" } }],
  },
  {
    id: "demo-ord-002", status: "SHIPPED", total: 234,
    createdAt: new Date("2026-05-03").toISOString(),
    user: { name: "Palesa Dlamini", email: "palesa@mail.com" },
    items: [{ product: { name: "Business Hosting Pro" } }],
  },
  {
    id: "demo-ord-003", status: "DELIVERED", total: 9899,
    createdAt: new Date("2026-05-04").toISOString(),
    user: { name: "Lerato Sithole", email: "lerato@mail.com" },
    items: [{ product: { name: "Samsung 27\" 4K Monitor" } }],
  },
];

export async function GET(request: NextRequest) {
  try {
    await requireDelivery(request);
    try {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user:  { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      });
      return Response.json(orders.map(o => ({ ...o, total: Number(o.total) })));
    } catch {
      return Response.json(DEMO_ADMIN_ORDERS);
    }
  } catch (error) {
    return jsonError(error);
  }
}
