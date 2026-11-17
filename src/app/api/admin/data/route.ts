import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";
import { adminToken } from "../login/route";

type Row = Record<string, unknown>;

export async function GET() {
  const jar = cookies();
  if (jar.get("admin_token")?.value !== adminToken()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  if (!db) {
    // demo mode — sample data so the dashboard is testable pre-Supabase
    const messages: Row[] = [
      { id: "demo-1", name: "Sam Rivera", email: "sam@studio.io", message: "Loved the site — can you build ours?", created_at: new Date().toISOString() },
      { id: "demo-2", name: "Priya N.", email: "priya@co.com", message: "Quote for a 3D product launch page?", created_at: new Date(Date.now() - 864e5).toISOString() },
    ];
    const subscribers: Row[] = [
      { id: "demo-1", email: "fan@example.com", created_at: new Date().toISOString() },
    ];
    return NextResponse.json({ ok: true, demo: true, messages, subscribers });
  }

  const [messages, subscribers] = await Promise.all([
    db.from("contacts").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("subscribers").select("*").order("created_at", { ascending: false }).limit(200),
  ]);

  return NextResponse.json({
    ok: true,
    messages: messages.data ?? [],
    subscribers: subscribers.data ?? [],
    error: messages.error?.message || subscribers.error?.message || undefined,
  });
}
