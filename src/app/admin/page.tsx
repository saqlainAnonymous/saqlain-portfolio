"use client";

import { FormEvent, useEffect, useState } from "react";

type Row = {
  id: string;
  name?: string;
  email: string;
  message?: string;
  created_at: string;
};

type Data = {
  ok: boolean;
  demo?: boolean;
  messages?: Row[];
  subscribers?: Row[];
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/data", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const json: Data = await res.json();
    setData(json);
    setAuthed(true);
  }

  useEffect(() => {
    load();
  }, []);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Wrong password.");
      return;
    }
    load();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setData(null);
  }

  if (authed === null) {
    return <main className="grid min-h-screen place-items-center font-body text-mist">Loading…</main>;
  }

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8"
        >
          <div className="section-label mb-6">Admin · Sign in</div>
          <input
            name="password"
            type="password"
            placeholder="Admin password"
            className="field"
            autoFocus
          />
          {error && <p className="mt-3 text-sm text-ember">{error}</p>}
          <button className="mt-6 w-full rounded-full bg-gold py-3 font-body text-sm font-semibold uppercase tracking-[0.2em] text-ink hover:bg-bone">
            Enter
          </button>
          <p className="mt-4 text-center font-body text-xs text-mist/60">
            Default dev password: <code>changeme</code> (set ADMIN_PASSWORD in .env.local)
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-32">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-bone md:text-5xl">Dashboard</h1>
        <button
          onClick={logout}
          className="rounded-full border border-line px-5 py-2 font-body text-xs uppercase tracking-[0.2em] text-mist hover:border-ember hover:text-ember"
        >
          Log out
        </button>
      </div>

      {data?.demo && (
        <p className="mt-4 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 font-body text-sm text-gold">
          Demo mode — connect Supabase (.env.local) to see real submissions.
        </p>
      )}

      <section className="mt-12">
        <h2 className="section-label mb-5">Messages ({data?.messages?.length ?? 0})</h2>
        <div className="space-y-4">
          {(data?.messages ?? []).map((m) => (
            <article key={m.id} className="rounded-2xl border border-line bg-panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-body font-semibold text-bone">
                  {m.name} <span className="font-normal text-mist">· {m.email}</span>
                </span>
                <span className="font-body text-xs text-mist">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 font-body text-sm leading-relaxed text-mist">{m.message}</p>
            </article>
          ))}
          {(data?.messages?.length ?? 0) === 0 && (
            <p className="font-body text-sm text-mist">No messages yet.</p>
          )}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="section-label mb-5">Subscribers ({data?.subscribers?.length ?? 0})</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {(data?.subscribers ?? []).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3 font-body text-sm"
            >
              <span className="text-bone">{s.email}</span>
              <span className="text-xs text-mist">
                {new Date(s.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
          {(data?.subscribers?.length ?? 0) === 0 && (
            <p className="font-body text-sm text-mist">No subscribers yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
