import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/lib/content";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = PROJECTS.find((p) => p.slug === params.slug);
  return {
    title: project ? `${project.title} — ${project.status}` : "Project",
    description: project?.blurb,
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = PROJECTS.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const [a, b] = project.art;
  const next = PROJECTS[(PROJECTS.indexOf(project) + 1) % PROJECTS.length];

  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-32 pt-36 md:px-10">
      <Link href="/#work" className="link-line font-body text-xs uppercase tracking-[0.3em] text-mist">
        ← All work
      </Link>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-display text-6xl text-bone md:text-8xl">{project.title}</h1>
        <span className="font-display text-6xl italic text-gold/60 md:text-8xl">
          {project.index}
        </span>
      </div>

      {/* cover art — drop a screenshot in here when it exists */}
      <div
        className="relative mt-12 h-[46vh] overflow-hidden rounded-3xl border border-line md:h-[60vh]"
        style={{
          background: `radial-gradient(circle at 70% 20%, ${b}44, transparent 55%), radial-gradient(circle at 25% 80%, ${a} 0%, #0c0c10 72%)`,
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-10 right-4 select-none font-display text-[14rem] italic leading-none text-gold/10 md:-bottom-16 md:right-8 md:text-[20rem]"
        >
          {project.index}
        </span>
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-[240px_1fr]">
        <div className="space-y-8">
          <div>
            <div className="section-label mb-2">Status</div>
            <div className="font-body text-lg text-bone">{project.status}</div>
          </div>
          <div>
            <div className="section-label mb-2">Role</div>
            <div className="font-body text-lg text-bone">{project.role}</div>
          </div>
          <div>
            <div className="section-label mb-3">Stack</div>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
          {project.links && project.links.length > 0 && (
            <div>
              <div className="section-label mb-3">Links</div>
              <ul className="space-y-2">
                {project.links.map((l) => (
                  <li key={l.url + l.label}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="link-line font-body text-base text-mist transition-colors hover:text-bone"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6 font-body text-lg leading-relaxed text-mist">
          {project.description.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      {/* next project */}
      <Link
        href={`/projects/${next.slug}`}
        className="group mt-28 block border-t border-line pt-10"
      >
        <div className="section-label">Next project</div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-4xl text-bone transition-colors group-hover:text-gold md:text-6xl">
            {next.title}
          </span>
          <span className="font-body text-2xl text-mist transition-transform group-hover:translate-x-3">
            →
          </span>
        </div>
      </Link>
    </main>
  );
}
