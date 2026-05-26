import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export type JwtUser = {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

const secret = process.env.JWT_SECRET;

export function signToken(user: JwtUser) {
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(user, secret, { expiresIn: "7d" });
}

export async function getUserFromRequest(request: NextRequest) {
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtUser;
    return prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true }
    });
  } catch {
    return null;
  }
}

export async function requireUser(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireUser(request);

  if (user.role !== "ADMIN") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  return user;
}

export function jsonError(error: unknown) {
  if (error instanceof Response) {
    return error;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return Response.json({ error: message }, { status: 500 });
}
