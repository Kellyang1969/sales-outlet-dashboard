# Outlet performance dashboard

Vanilla JS + [Vite](https://vite.dev). Reads weekly sales, target, orders and returns per outlet
from the `outlet_weekly` table in Supabase.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Requires Node 20.19+ or 22.12+ (Vite 7). The first `npm install` creates `package-lock.json`;
commit it so Vercel installs the same versions you tested.

`.env` is already filled in for your Supabase project and is git-ignored. To use another project,
copy `.env.example` to `.env` and change the two values.

## Deploy to Vercel

1. Push this folder to a GitHub repo (`.env` and `node_modules` are ignored by `.gitignore`).
2. In Vercel: **Add New → Project**, import the repo. Vercel detects Vite automatically
   (build command `npm run build`, output directory `dist`).
3. Before the first deploy, open **Environment Variables** and add, for Production and Preview:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://hcxtthnxdijjkjlakdqi.supabase.co` |
   | `VITE_SUPABASE_KEY` | your `sb_publishable_...` key |

4. Deploy. If you change an env variable later, **redeploy**: Vite bakes `VITE_` values into the
   build, so existing deployments don't pick up changes.

## Project layout

```
index.html        page shell
src/main.js       boot, filter + retry handlers
src/data.js       loadData(): the only place that talks to Supabase
src/render.js     data -> HTML (KPI cards, chart, "Needs attention")
src/utils.js      formatting helpers
src/style.css     styles
```

## Data and security

- Table: `public.outlet_weekly` (`outlet`, `week`, `sales`, `target`, `orders`, `returns`),
  one row per outlet per week.
- Row Level Security is on with a read-only policy for the browser key, so the key in the
  deployed site can read the table but never change it. Because that read is public, anyone
  who has the site can read these figures; add Supabase Auth and tighten the policy if they
  are sensitive.
- Add new weeks or outlets by inserting rows (Supabase table editor or SQL). The dashboard picks
  them up on refresh and builds the outlet filter from the data.
