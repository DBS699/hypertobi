# HYPERTOBI — hypertobi.vercel.app

Vite vanilla-JS multi-page site (wrapping-paper design) + Sveltia CMS.

## Develop
```
npm install
npm run dev        # → http://localhost:5181 (or via launch config, port 5187)
npx vite build     # → dist/
```

## Deploy
Pushing to `main` on GitHub (DBS699/hypertobi) auto-deploys via Vercel.

## CMS (Sveltia) — /admin
Editors log in with GitHub and edit:
- **Photos (gallery)** → `public/content/photos.json` (+ uploads to `public/uploads/`)
- **Pizza prices** → `public/content/pizza.json`

Commits from the CMS trigger a Vercel rebuild → live in ~1 minute.

### One-time setup for CMS login (3 steps)
1. **GitHub OAuth App**: github.com → Settings → Developer settings → OAuth Apps →
   New OAuth App. Homepage: `https://hypertobi.ch`,
   Authorization callback URL: `https://hypertobi.ch/api/callback`.
2. **Vercel env vars**: Vercel project → Settings → Environment Variables →
   add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from the OAuth app → redeploy.
3. **Git integration**: Vercel project → Settings → Git → connect `DBS699/hypertobi`
   (skip if the project was imported from GitHub in the first place).

If the production domain differs from hypertobi.vercel.app, update `base_url`,
`site_url` and `display_url` in `public/admin/config.yml`.
