# EL DAMARANY — Corporate Website & CMS

**شركة الضمراني للمقاولات ورصف الطرق**

A bilingual (Arabic / English) corporate website with a complete content
management dashboard. Every piece of public content — projects, photographs,
homepage copy, contact details, social links — is edited from `/admin`. No code
changes are needed for day-to-day content work.

---

## Contents

1. [Technology](#technology)
2. [Running it locally](#running-it-locally)
3. [Environment variables](#environment-variables)
4. [Creating the first administrator](#creating-the-first-administrator)
5. [Media storage](#media-storage)
6. [Using the dashboard](#using-the-dashboard)
7. [Project structure](#project-structure)
8. [Database](#database)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Content policy](#content-policy)

---

## Technology

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, TypeScript strict) |
| Styling | Tailwind CSS v4 (CSS-first theme) |
| Database | PostgreSQL 14+ via Prisma 7 (`@prisma/adapter-pg`) |
| Localisation | next-intl — `/ar` and `/en`, full RTL / LTR |
| Motion | Framer Motion, respecting `prefers-reduced-motion` |
| Media | Cloudflare R2 / any S3-compatible bucket, or local disk |
| Images | `next/image` with AVIF + WebP, blur placeholders, focal points |
| Auth | Server-side sessions, scrypt password hashing |
| Drag & drop | dnd-kit (pointer + keyboard accessible) |

---

## Running it locally

```bash
npm install
cp .env.example .env      # then edit .env — see below
npm run setup             # starts a local database, migrates, seeds
npm run dev
```

Open **http://localhost:3000** — the site — and **http://localhost:3000/admin**
for the dashboard.

> Use `localhost`, not `127.0.0.1`. The Next.js development server only serves
> its client bundles to recognised origins; on another address the page loads
> but never becomes interactive.

### No PostgreSQL installed?

`npm run setup` boots a real PostgreSQL 18 server from bundled binaries — no
system install, no Docker. It listens on port `54329` and stores its data in
`.localdb/` (git-ignored).

```bash
npm run db:start     # start it
npm run db:status    # is it running?
npm run db:stop      # stop it
npm run db:reset     # wipe and recreate (destroys all local data)
```

For production, point `DATABASE_URL` at a managed PostgreSQL instance instead.
Nothing else changes.

---

## Environment variables

Copy `.env.example` to `.env`. Required in every environment:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Signs session cookies. Generate a fresh one per environment |
| `NEXT_PUBLIC_SITE_URL` | Public origin — canonical URLs, sitemap, Open Graph |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Optional:

| Variable | Default | Purpose |
| --- | --- | --- |
| `STORAGE_DRIVER` | `local` | `local` or `r2` |
| `LOCAL_STORAGE_DIR` | `./var/uploads` | Where local uploads are written |
| `MAX_UPLOAD_MB` | `15` | Per-file upload limit |
| `R2_*` | — | Required when `STORAGE_DRIVER=r2` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | — | Used once, to seed the first administrator |

**Never commit `.env`.** It is git-ignored.

---

## Creating the first administrator

No password is hardcoded anywhere. Choose one of:

**A — during seeding.** Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then
`npm run db:seed`. An existing account is never overwritten.

**B — interactively**, at any time:

```bash
npm run admin:create
npm run admin:create -- --email owner@example.com --name "Site Owner"
```

Run against an existing address to reset that password; all of its sessions are
invalidated.

Passwords must be at least 12 characters and contain a letter and a number.

### Roles

| Role | Can do |
| --- | --- |
| `EDITOR` | Projects, media, all content, settings, messages |
| `ADMIN` | Everything, plus **deleting** records and managing users |

Destructive actions are refused server-side for editors, not merely hidden.

---

## Media storage

### Local (default)

Files are written to `LOCAL_STORAGE_DIR` (outside `public/`) and served by
`/api/media/[...path]`. This is deliberate: files placed in `public/` after a
build are never served. Suitable for development and single-server hosting with
a persistent disk.

### Cloudflare R2 (recommended for production)

```env
STORAGE_DRIVER="r2"
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="eldamarany-media"
R2_PUBLIC_URL="https://media.yourdomain.com"
```

1. Create a bucket in the Cloudflare dashboard.
2. Expose it publicly — a custom domain, or the `r2.dev` subdomain.
3. Create an API token with **Object Read & Write** for that bucket.
4. Set the variables above and redeploy.

URLs are derived from the stored key at read time, so switching drivers does not
strand existing records — only the files themselves need moving.

### What happens to an upload

Every file is checked by its actual bytes, not its declared type. Rasters are
re-encoded (which strips EXIF, including GPS), capped at 2800px on the longest
edge, and given a random storage key. SVG is sanitised — scripts, event
handlers and external references removed — and additionally served under a
sandboxed CSP. Accepted: JPEG, PNG, WebP, AVIF, SVG.

---

## Using the dashboard

### Adding a project

1. **Projects → New project**
2. Enter the name in Arabic and English. Anything unknown, leave empty — the
   site hides empty fields rather than inventing text.
3. **Save draft.** The gallery unlocks once the project exists.
4. **Add images** — drag files in, or pick from the library. The first image
   becomes hero and cover automatically.
5. **Drag to reorder.** The order saves immediately.
6. **Hero** opens the project page; **Cover** appears on cards and listings.
7. **Edit** on any image opens the focal-point editor.
8. **Preview draft** opens the page privately, before publishing.
9. **Publish.** It appears on the site straight away.

### Image position (focal point)

Photographs are cropped differently on a wide banner and a narrow phone screen.
The focal point marks what must stay visible.

- Drag the marker, or use the sliders.
- **Desktop** and **Mobile** are set separately — the mobile crop is much
  tighter.
- Live previews show both crops as they will appear.
- The source file is never modified; only a percentage is stored.

Set a default in the Media Library, and override it per project under
**Edit** on a gallery image.

### Editing the homepage

**Homepage** — every band top to bottom: hero image and headline, the
introduction, statistics label, services, projects, quality, risk, and the
closing call to action. Each section can be hidden.

Further down, **Projects on the homepage**: tick the ones to feature and drag
them into order.

### Contact details, WhatsApp and social links

**Site Settings** — phone, mobile, email, addresses, Google Maps link, logo
files, and search-engine defaults. Only fields you fill in appear on the site.

For WhatsApp, enter the number in full international form, digits only
(`201234567890`). The `wa.me` link, the contact button and the floating button
are generated from it. The floating button has its own on/off switch.

**Social Links** — paste each profile URL. Empty fields show nothing; no
placeholder icons ever appear.

### Contact messages

**Contact Messages** — every enquiry, with **New / Contacted / Closed** and a
private note field. The sidebar shows a count of unread ones.

### Other content

| Screen | Controls |
| --- | --- |
| Pages & SEO | Headers, introductions, per-page titles, descriptions, sharing images. Privacy and Terms start as drafts — publish once written, and they appear in the footer |
| Services / Sectors / Capabilities | Editorial lists, drag to reorder |
| Quality & Safety | The two themed columns |
| Risk Management | The numbered process steps |
| Timeline | Company history |
| Statistics | Headline figures. **A statistic with no value is hidden automatically** |
| Collections | Umbrella groups such as Alexandria Governorate Projects |
| Navigation | Header and footer menus |
| Users | Accounts and roles (administrators only) |
| Activity Log | Who changed what, and when |

### Maintenance mode

**Site Settings → Maintenance mode** closes the public site and removes it from
search indexes. Signed-in staff keep full access.

---

## Project structure

```
prisma/
  schema.prisma          Data model
  seed.ts                Verified initial content
scripts/
  localdb.mjs            Local PostgreSQL control
  create-admin.ts        First-run administrator
  e2e.mjs                End-to-end test suite
messages/                UI strings (ar.json, en.json)
src/
  app/
    [locale]/            Public site (root layout, RTL/LTR)
    admin/               Dashboard (separate root layout)
      (dashboard)/       Authenticated screens
    api/
      media/[...path]/   Serves local uploads
      admin/media/       Upload + picker endpoints
    sitemap.ts robots.ts
  components/
    site/ home/ sections/ projects/ contact/   Public
    admin/                                      Dashboard
    motion/ ui/                                 Shared
  lib/
    auth/                Sessions, scrypt hashing, guards
    content/             Read layer for the public site
    admin/               Write layer, resource registry
    media/               Upload validation and processing
    storage/             local + r2 drivers
  i18n/                  Locale config and request setup
  generated/prisma/      Prisma client (generated)
  proxy.ts               Locale routing
```

---

## Database

Twenty-two models. The ones worth knowing:

- **Project** — bilingual fields, slugs per language, draft/published, an
  unguessable `previewToken`, featured flag and order, embedded SEO.
- **MediaAsset** — one row per uploaded file, reusable everywhere, with default
  focal points and metadata. Binary data is never stored in the database.
- **ProjectImage** — joins a project to an asset. Hero and cover are flags, so
  the same file is never uploaded twice. Carries per-usage focal points, alt
  text and caption that override the asset's defaults.
- **HomepageSection / Page / ContentBlock** — editable copy and per-page SEO.
- **SiteSetting** — a single row holding global configuration.
- **User / Session / ActivityLog** — access and audit. Only a SHA-256 of each
  session token is stored, so a database dump cannot be replayed as a login.

```bash
npm run db:migrate       # create a migration during development
npm run db:deploy        # apply migrations (production)
npm run db:seed          # idempotent; never overwrites edited content
npm run db:studio        # browse the data
```

---

## Testing

```bash
npm run check            # TypeScript + ESLint
npm run test:e2e         # full browser workflow (app must be running)
```

The end-to-end suite drives a real browser through the workflow this site
exists to support: sign in, create a project, upload three photographs, drag to
reorder, reassign hero, set separate desktop and mobile focal points, preview
the draft (and confirm it 404s without the token), publish, verify it appears in
both language archives and on the homepage with the focal point applied, open
the lightbox, filter the archive, submit the contact form, read it in the inbox,
save settings and confirm the WhatsApp link, edit the homepage headline and see
it live, then delete the project and its media.

It also checks for horizontal overflow at 320/375/430/768/1024px, RTL rendering,
the 404 page, the sitemap, robots.txt, and console errors.

First run needs the browser binary:

```bash
npx playwright install chromium
```

**Current status: 49 / 49 passing against a production build.**

The suite creates and then removes its own data.

---

## Deployment

### Vercel

1. Push the repository to GitHub and import it into Vercel.
2. Provision PostgreSQL (Neon, Supabase, or Vercel Postgres).
3. Set the environment variables — `DATABASE_URL`, `AUTH_SECRET`,
   `NEXT_PUBLIC_SITE_URL`, and the `R2_*` group.
   **Use `STORAGE_DRIVER=r2`:** serverless hosts have no persistent disk, so
   local storage would lose every upload.
4. Deploy. `npm run build` runs `prisma generate` first.
5. Apply migrations and create the administrator:

```bash
DATABASE_URL="<production url>" npx prisma migrate deploy
DATABASE_URL="<production url>" npm run db:seed
DATABASE_URL="<production url>" npm run admin:create
```

### A server you control (VPS, Docker)

```bash
npm ci
npm run build
npx prisma migrate deploy
npm run db:seed
npm start
```

Run it behind nginx or Caddy with TLS. `STORAGE_DRIVER=local` is fine here as
long as `LOCAL_STORAGE_DIR` is on a persistent volume that is backed up.

### Checklist before going live

- [ ] `AUTH_SECRET` freshly generated, not the development one
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain
- [ ] Administrator password changed from any seeded value
- [ ] `STORAGE_DRIVER=r2` if the host has no persistent disk
- [ ] HTTPS enabled — session cookies are `Secure` in production
- [ ] Database backups scheduled
- [ ] Contact details and social links filled in
- [ ] Logo and hero image uploaded

---

## Content policy

This build treats unverified information as a defect. Only what the company
supplied is present:

- **Founded 1978.** Head office in Smouha, Alexandria; branch on El Nasr Street.
- **Seven projects**, by name and sector: Ras Badran Oil Storage Complex, MIDOR,
  Mohamed Naguib Military Base, Meleiha Gas Road, Smouha Bridges, Nitrogen
  Fertilizer Complex, and Alexandria Governorate Projects.
- **Geographic scope:** Egypt, all governorates. No international claims.

Everything else is deliberately empty and waiting in the dashboard: phone
numbers, email, WhatsApp, social profiles, project years, clients, values,
descriptions, photographs.

Three rules enforced in code:

1. **Empty content is hidden, never faked.** No placeholder paragraphs, no empty
   cards, no "Lorem ipsum". A statistic with no value does not render.
2. **Missing photographs show a neutral architectural placeholder** that could
   not be mistaken for a real project photograph.
3. **Contact channels and social links appear only once entered.**

When you add real figures, descriptions and photographs through the dashboard,
those sections appear on their own.
