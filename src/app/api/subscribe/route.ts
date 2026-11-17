import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const Body = z.object({
  email: z.string().trim().email().max(200),
});

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`subscribe:${ip}`, 8, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Slow down a little." },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 422 });
  }

  const db = getSupabase();
  if (db) {
    const { error } = await db
      .from("subscribers")
      .insert({ email: parsed.data.email.toLowerCase() });

    // unique violation = already subscribed, which is fine
    if (error && error.code !== "23505") {
      console.error("[subscribe] insert failed:", error.message);
      return NextResponse.json({ ok: false, error: "Storage error" }, { status: 500 });
    }
    if (error && error.code === "23505") {
      return NextResponse.json({ ok: true, already: true });
    }
    return NextResponse.json({ ok: true });
  }

  console.log("[subscribe:demo]", parsed.data.email);
  return NextResponse.json({ ok: true, demo: true });
}
