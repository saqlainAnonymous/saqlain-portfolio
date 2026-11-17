import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { cookies } from "next/headers";

const Body = z.object({ password: z.string().min(1).max(200) });

/** Signed session token derived from the admin secret. */
export function adminToken(): string {
  return createHash("sha256")
    .update(`admin:${process.env.ADMIN_SECRET ?? "dev-secret"}`)
    .digest("hex");
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  const expected = process.env.ADMIN_PASSWORD ?? "changeme";

  if (!parsed.success || parsed.data.password !== expected) {
    // constant-ish delay to blunt brute force
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }

  const jar = cookies();
  jar.set("admin_token", adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = cookies();
  jar.delete("admin_token");
  return NextResponse.json({ ok: true });
}
