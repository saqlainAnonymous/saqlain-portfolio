"use client";

import { FormEvent, useState } from "react";
import { z } from "zod";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";
import { SITE } from "@/lib/content";

const schema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters"),
  email: z.string().trim().email("That email doesn't look right"),
  message: z.string().trim().min(10, "Tell me a little more (10+ chars)"),
});

type Status = "idle" | "sending" | "success" | "error" | "offline";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[String(issue.path[0])] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      setStatus("sending");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("Request failed");
      const json = (await res.json().catch(() => ({}))) as { demo?: boolean };
      // no inbox is wired up yet — say so instead of faking a delivery
      if (json.demo) {
        setStatus("offline");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative mx-auto max-w-[1400px] px-6 pb-32 pt-32 md:px-10 md:pb-44 md:pt-44">
      <div className="grid gap-16 md:grid-cols-[280px_1fr]">
        <div className="md:sticky md:top-32 md:self-start">
          <div className="section-label">04 — Contact</div>
        </div>

        <div>
          <Reveal>
            <h2 className="font-display text-[13vw] leading-[0.95] text-bone md:text-[7rem]">
              Have an idea?
              <br />
              <span className="italic text-gold">Let&apos;s build it.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-10 max-w-xl font-body text-lg leading-relaxed text-mist">
              I&apos;m always interested in meaningful projects, innovative ideas, open-source
              collaboration, and opportunities to learn and build.
            </p>
          </Reveal>

          <div className="mt-20 grid gap-16 md:grid-cols-2">
            {/* form */}
            <Reveal>
              <form onSubmit={onSubmit} className="space-y-8">
                <div>
                  <input name="name" placeholder="Your name" className="field" autoComplete="name" />
                  {errors.name && <p className="mt-2 text-sm text-ember">{errors.name}</p>}
                </div>
                <div>
                  <input name="email" type="email" placeholder="Email address" className="field" autoComplete="email" />
                  {errors.email && <p className="mt-2 text-sm text-ember">{errors.email}</p>}
                </div>
                <div>
                  <textarea name="message" rows={4} placeholder="Tell me about your project…" className="field resize-none" />
                  {errors.message && <p className="mt-2 text-sm text-ember">{errors.message}</p>}
                </div>

                <Magnetic>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="rounded-full bg-gold px-8 py-4 font-body text-sm font-semibold uppercase tracking-[0.2em] text-ink transition-all hover:bg-bone disabled:opacity-50"
                  >
                    {status === "sending" ? "Sending…" : "Send it →"}
                  </button>
                </Magnetic>

                {status === "success" && (
                  <p className="font-body text-sm text-gold">
                    Received — thanks for reaching out. ✓
                  </p>
                )}
                {status === "error" && (
                  <p className="font-body text-sm text-ember">
                    Something broke on the way. Try again in a moment.
                  </p>
                )}
                {status === "offline" && (
                  <p className="font-body text-sm text-mist">
                    This inbox isn&apos;t connected yet — say hello on{" "}
                    <a
                      href={SITE.socials[0]?.url}
                      target="_blank"
                      rel="noreferrer"
                      className="link-line text-gold"
                    >
                      GitHub
                    </a>{" "}
                    in the meantime.
                  </p>
                )}
              </form>
            </Reveal>

            {/* details */}
            <Reveal delay={0.15}>
              <div className="space-y-10">
                <div>
                  <div className="section-label mb-4">Based in</div>
                  <div className="font-body text-xl text-bone">Abbottabad, Pakistan</div>
                </div>
                <div>
                  <div className="section-label mb-4">Socials</div>
                  <ul className="space-y-3">
                    {SITE.socials.map((s) => (
                      <li key={s.label}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="link-line font-body text-lg text-mist transition-colors hover:text-bone"
                        >
                          {s.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="section-label mb-4">Status</div>
                  <p className="flex items-center gap-3 font-body text-lg text-mist">
                    <span className="inline-block h-2 w-2 animate-pulseDot rounded-full bg-gold" />
                    Remote — Worldwide
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
