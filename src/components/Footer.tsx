"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/content";
import Magnetic from "./Magnetic";

const MARQUEE = "Open to remote work — Let's build something meaningful — ";

export default function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Karachi",
        })
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    const json = res ? ((await res.json().catch(() => ({}))) as { demo?: boolean; already?: boolean }) : {};
    form.reset();
    window.alert(
      json.demo
        ? "The mailing list isn't connected yet — follow on GitHub for updates."
        : json.already
          ? "You're already on the list. ✓"
          : "You're on the list. ✓"
    );
  }

  return (
    <footer className="relative border-t border-line">
      {/* marquee */}
      <div className="overflow-hidden border-b border-line py-5">
        <div className="flex w-max animate-marquee whitespace-nowrap font-display text-3xl italic text-mist md:text-4xl">
          <span className="pr-8">{MARQUEE.repeat(3)}</span>
          <span className="pr-8">{MARQUEE.repeat(3)}</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:grid-cols-4 md:px-10">
        <div>
          <div className="font-display text-2xl text-bone">{SITE.brand}</div>
          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-mist">
            {SITE.tagline}
          </p>
        </div>

        <div>
          <div className="section-label mb-5">Menu</div>
          <ul className="space-y-3 font-body text-sm text-mist">
            {["About", "Work", "Stack", "Contact"].map((l) => (
              <li key={l}>
                <a href={`#${l.toLowerCase()}`} className="link-line hover:text-bone">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="section-label mb-5">Newsletter</div>
          <form onSubmit={subscribe} className="flex max-w-xs items-center border-b border-line focus-within:border-gold">
            <input
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className="w-full bg-transparent py-2 font-body text-sm text-bone placeholder:text-mist/50 focus:outline-none"
            />
            <button className="pl-3 font-body text-sm text-gold hover:text-bone" type="submit">
              →
            </button>
          </form>
          <p className="mt-3 font-body text-xs text-mist/70">
            Occasional notes on builds, no spam.
          </p>
        </div>

        <div className="flex flex-col items-start justify-between gap-8 md:items-end">
          <div className="font-body text-sm text-mist">
            Abbottabad time —{" "}
            <span className="tabular-nums text-bone">{time}</span>
          </div>
          <Magnetic>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="rounded-full border border-line px-6 py-3 font-body text-xs uppercase tracking-[0.25em] text-mist transition-colors hover:border-gold hover:text-gold"
            >
              Back to top ↑
            </button>
          </Magnetic>
        </div>
      </div>

      <div className="border-t border-line/60 px-6 py-6 text-center font-body text-xs text-mist/60 md:px-10">
        © {new Date().getFullYear()} {SITE.name} — All rights reserved.
      </div>
    </footer>
  );
}
