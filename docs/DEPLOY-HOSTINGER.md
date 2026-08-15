# Deploying to Hostinger Business Web Hosting

This site is a Next.js server application with a PostgreSQL database. Hostinger
Business and Cloud plans can run it as a **Node.js web app** deployed straight
from GitHub.

Two things Hostinger does not provide have to come from elsewhere:

| Need | Why | Service |
| --- | --- | --- |
| PostgreSQL | Hostinger offers MySQL only | Supabase (free tier) |
| Object storage | The app filesystem is replaced on every deploy, so uploads would vanish | Cloudflare R2 (free tier) |

Both have free tiers that comfortably fit a corporate site.

---

## 1 · Database (Supabase)

1. Create an account at <https://supabase.com> and start a **New project**.
2. Choose a region close to your visitors (Frankfurt is a good choice for Egypt).
3. Set a strong database password and save it.
4. Wait for provisioning, then open **Connect** (top of the project page).
5. Choose the **Session pooler** connection string.

> **Use the Session pooler, not the direct connection and not Transaction mode.**
>
> - The *direct* connection is IPv6-only on new projects; most shared hosts
>   cannot reach it.
> - *Transaction* mode (port 6543) disables prepared statements, which Prisma
>   relies on.
> - *Session* mode is IPv4-compatible and behaves like a normal PostgreSQL
>   connection, which is what a long-running Node server wants.

The string looks like:

```
postgresql://postgres.abcdefghijkl:YOUR-PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

Append `?sslmode=require`:

```
postgresql://postgres.abcdefghijkl:YOUR-PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Keep this as your production `DATABASE_URL`.

---

## 2 · Media storage (Cloudflare R2)

1. Sign in at <https://dash.cloudflare.com> → **R2** → **Create bucket**
   (for example `eldamarany-media`).
2. Open the bucket → **Settings** → **Public access** → enable a public
   development URL, or connect a custom domain such as
   `media.yourdomain.com`. Note the resulting public base URL.
3. Go to **R2 → Manage API tokens → Create API token**:
   - Permission: **Object Read & Write**
   - Scope: this bucket only
4. Save the **Access Key ID**, **Secret Access Key**, and the S3 endpoint
   `https://<account-id>.r2.cloudflarestorage.com`.

---

## 3 · Prepare the database (run once, from your computer)

Migrations are not part of the Hostinger build, so apply them yourself against
the production database.

PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://...pooler.supabase.com:5432/postgres?sslmode=require"

npx prisma migrate deploy      # create the tables
npm run db:seed                # verified starting content
npm run admin:create           # your administrator account
```

`db:seed` never overwrites content you have already edited, so it is safe to
re-run.

---

## 4 · Create the app in hPanel

1. <https://hpanel.hostinger.com> → **Websites** → your site → **Node.js**
   (sometimes shown as *Web Apps*).
2. **Create application** → deploy from **GitHub**, authorise Hostinger, and
   pick `saadellaty-cyber/aldamrany-website`, branch `main`.
3. Settings:

| Setting | Value |
| --- | --- |
| Node version | **22.x** (20.x also works; 18.x does not) |
| Build command | `npm run build` |
| Start command | `npm start` |
| Entry / output | leave as detected for Next.js |

4. Add the environment variables below **before** the first deploy.

### Environment variables

| Name | Value |
| --- | --- |
| `DATABASE_URL` | the Supabase session-pooler string from step 1 |
| `AUTH_SECRET` | a **fresh** 64-character hex string — never reuse the development one |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| `STORAGE_DRIVER` | `r2` |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | from step 2 |
| `R2_SECRET_ACCESS_KEY` | from step 2 |
| `R2_BUCKET` | `eldamarany-media` |
| `R2_PUBLIC_URL` | the bucket's public base URL |
| `NODE_ENV` | `production` |

Generate the secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> `STORAGE_DRIVER=r2` is not optional. With `local`, every uploaded photograph
> is deleted the next time the app is deployed.

5. Deploy. The first build takes a few minutes.

---

## 5 · Domain and HTTPS

Point the domain at the Node.js app in hPanel and enable the free SSL
certificate. Session cookies are marked `Secure` in production, so **sign-in
will not work over plain HTTP** — HTTPS is required, not optional.

Make sure `NEXT_PUBLIC_SITE_URL` matches the final domain exactly, including
`https://` and no trailing slash. It is used for canonical URLs, the sitemap
and social sharing tags.

---

## 6 · After the first deploy

Check, in order:

- [ ] `https://yourdomain.com` redirects to `/ar`
- [ ] `https://yourdomain.com/en` renders in English, left-to-right
- [ ] `/admin/login` loads and you can sign in
- [ ] Upload an image in **Media Library** — it must appear, and its URL should
      be on your R2 domain
- [ ] Redeploy, then confirm that image is *still there* (this is what proves
      R2 is configured; with local storage it would be gone)
- [ ] Create a test project, publish it, confirm it appears on `/ar/projects`
- [ ] `https://yourdomain.com/sitemap.xml` and `/robots.txt` respond

---

## Updating the site later

Content — projects, photographs, text, settings — is edited in `/admin` and
needs no deployment.

For code changes:

```powershell
git add -A
git commit -m "Describe the change"
git push
```

Hostinger rebuilds automatically. If you changed `prisma/schema.prisma`, also
run `npx prisma migrate deploy` against the production `DATABASE_URL`.

---

## Troubleshooting

**Build fails on Node version** — set 20.x or 22.x; the app requires ≥ 20.9.

**"Missing required environment variable DATABASE_URL"** — the variables were
added after the build. Re-deploy so the new values are picked up.

**Sign-in appears to succeed but returns to the login page** — the site is being
served over HTTP. Session cookies are `Secure` in production; enable SSL.

**Database connection times out** — you used the direct connection string
(IPv6-only). Switch to the **Session pooler** string.

**`prepared statement "s0" already exists`** — you used the Transaction pooler
on port 6543. Switch to Session mode on port 5432.

**Uploaded images disappear after a deploy** — `STORAGE_DRIVER` is not set to
`r2`, or the R2 variables are wrong.

**Images return 403** — the R2 bucket has no public access configured, or
`R2_PUBLIC_URL` does not match the public domain.
