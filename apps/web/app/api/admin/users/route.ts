import { NextRequest } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    return Response.json(users);
  } catch (error) {
    return jsonError(error);
  }
}
