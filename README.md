# Saqlain Shah — Portfolio

A cinematic, dark-themed personal portfolio for **Saqlain Shah** — an aspiring developer and
technology enthusiast from Abbottabad, Pakistan, working at the intersection of artificial
intelligence, software development, and digital storytelling.

Built with Next.js 14, React Three Fiber, GSAP and Lenis. The interface is a single continuous
3D world: a shader-driven particle field and sculpted form that recede as you scroll from the
hero into the content.

> **Live site:** _added after the first deployment_

---

## Highlights

- **Continuous 3D world** — a fixed WebGL layer with a scroll-driven camera (React Three Fiber,
  custom GLSL). The scene pauses when it leaves the viewport and degrades gracefully on mobile
  and for `prefers-reduced-motion`.
- **Cinematic preloader** — a ring that resolves into the hero, with CSS and static fallbacks
  when WebGL is unavailable.
- **Custom cursor with a text lens** — a dot and trailing ring that becomes a glass loupe over
  readable type: the block is cloned, magnified, and clipped to a gold-rimmed disc.
- **Horizontal project rail** — a native scroller with a progress indicator, tilt cards, and
  per-project detail pages generated at build time.
- **Honest content model** — every identity string, project, and skill lives in one typed file;
  no fabricated metrics, clients, awards, or proficiency percentages.
- **Real backend hooks** — contact and newsletter endpoints backed by Supabase, with a private
  admin dashboard for reading submissions. Without Supabase configured, the contact form says so
  instead of pretending to deliver.
- **Accessible and responsive** — keyboard-reachable navigation, reduced-motion support, and
  layouts verified from 390px upward.

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, custom CSS tokens |
| 3D | Three.js, React Three Fiber, drei, postprocessing, custom GLSL |
| Motion | GSAP + ScrollTrigger, Lenis smooth scroll, Framer Motion |
| Backend | Next.js route handlers, Supabase, Zod, in-memory rate limiting |
| Fonts | Fraunces (display) and Inter (body) via `next/font` |

## Getting started

```bash
# 1. install dependencies
npm install

# 2. add environment variables (optional — see below)
cp .env.example .env.local   # or create the file manually

# 3. run the development server
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Environment variables

The site runs without a backend; the contact and newsletter forms simply report that they are
not connected yet.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL used by metadata, Open Graph and `sitemap.xml`. |
| `SUPABASE_URL` | for forms | Supabase project URL. |
| `SUPABASE_SERVICE_KEY` | for forms | Service-role key (server only — never expose it to the client). |
| `ADMIN_PASSWORD` | for `/admin` | Password for the private submissions dashboard. |
| `ADMIN_SECRET` | for `/admin` | Secret used to sign the admin session cookie. |

Secrets belong in `.env.local` (or the Vercel project settings) and are git-ignored.

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx              # metadata, fonts, Person JSON-LD
│  ├─ page.tsx                # section composition
│  ├─ globals.css             # design tokens, cursor + lens styles
│  ├─ projects/[slug]/        # statically generated project pages
│  ├─ admin/                  # private submissions dashboard
│  └─ api/                    # contact, subscribe, admin routes
├─ components/
│  ├─ Hero.tsx  About.tsx  Projects.tsx  Skills.tsx  Contact.tsx  Footer.tsx
│  ├─ CustomCursor.tsx        # dot, ring and optical text lens
│  ├─ Preloader.tsx           # cinematic intro with fallbacks
│  └─ scene/                  # WebGL world: camera rig, particles, shader form
└─ lib/
   ├─ content.ts              # ← all site copy and identity lives here
   ├─ shaders.ts
   └─ supabase.ts
```

## Editing content

`src/lib/content.ts` is the single source of truth:

- `SITE` — name, brand mark, role, location, availability, tagline, social links
- `PROJECTS` — title, status, role, stack, description, links, cover gradient
- `SKILLS` — the stack, grouped by category (no percentage scores)
- `STATS` — short facts shown in the About section

Change a value there and every section, project page, and metadata entry that references it
updates.

## Deployment

The project deploys to Vercel as a standard Next.js app:

1. Import the GitHub repository into Vercel (Hobby plan is sufficient).
2. Add the environment variables above to the project.
3. Every push to `main` triggers a production deployment; pull requests get preview URLs.

`NEXT_PUBLIC_SITE_URL` should be set to the production domain so canonical and Open Graph URLs
resolve correctly.

## License

Source code is available for reference. The written content, project descriptions and personal
photography are © Saqlain Shah and may not be reused without permission.

## Contact

- GitHub: [@saqlainAnonymous](https://github.com/saqlainAnonymous)
