import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export type Role = "CUSTOMER" | "ADMIN" | "DELIVERY_STAFF" | "SUPER_ADMIN";

export type JwtUser = {
  id: string;
  email: string;
  role: Role;
  name?: string;
};

const secret = process.env.JWT_SECRET ?? "change-this-before-production";

export function signToken(user: JwtUser) {
  return jwt.sign(user, secret, { expiresIn: "7d" });
}

export function getUserFromToken(request: NextRequest): JwtUser | null {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, secret) as JwtUser;
  } catch {
    return null;
  }
}

export async function requireUser(request: NextRequest): Promise<JwtUser> {
  const user = getUserFromToken(request);
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

export async function requireRole(request: NextRequest, ...roles: Role[]): Promise<JwtUser> {
  const user = await requireUser(request);
  if (!roles.includes(user.role)) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

export const requireAdmin      = (req: NextRequest) => requireRole(req, "ADMIN", "SUPER_ADMIN");
export const requireSuperAdmin = (req: NextRequest) => requireRole(req, "SUPER_ADMIN");
export const requireDelivery   = (req: NextRequest) => requireRole(req, "DELIVERY_STAFF", "ADMIN", "SUPER_ADMIN");

export function jsonError(error: unknown) {
  if (error instanceof Response) return error;
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return Response.json({ error: message }, { status: 500 });
}
