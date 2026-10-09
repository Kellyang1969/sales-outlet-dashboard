/* ------------------------------------------------------------------
   DATA LOADING — the only place data enters the dashboard.

   Reads the `outlet_weekly` table from Supabase through its REST API and
   resolves to an array of:
     { outlet: string, week: 'YYYY-MM-DD', sales, target, orders, returns }  (numbers)

   Configuration comes from Vite env variables (see .env.example):
     VITE_SUPABASE_URL   e.g. https://xxxx.supabase.co
     VITE_SUPABASE_KEY   the project's *publishable* key (safe for browsers;
                         what it can do is controlled by Row Level Security).
   Never put a secret / service_role key in a VITE_ variable: everything
   prefixed VITE_ is bundled into the public JavaScript.
------------------------------------------------------------------- */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Display order for outlets; any new outlet follows, A–Z.
const OUTLET_ORDER = ['Tampines', 'Jurong', 'Orchard'];

export async function loadData() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Supabase isn’t configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY ' +
      '(in .env locally, or in Vercel → Settings → Environment Variables) and rebuild.'
    );
  }

  const url = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/outlet_weekly`
    + '?select=outlet,week,sales,target,orders,returns&order=week.asc';

  let res;
  try {
    res = await fetch(url, { headers: { apikey: SUPABASE_KEY } });
  } catch (err) {
    // The request never completed: offline, DNS, firewall, ad blocker, CORS.
    console.error('Supabase request failed', err);
    throw new Error('Couldn’t reach Supabase. Check your internet connection, or whether an ad blocker or firewall is blocking supabase.co.');
  }

  if (!res.ok) {
    const body = (await res.text()).slice(0, 200);
    console.error('Supabase error', res.status, body);
    throw new Error(`Supabase returned an error (HTTP ${res.status}). ${body}`.trim());
  }

  const rank = o => { const i = OUTLET_ORDER.indexOf(o); return i === -1 ? OUTLET_ORDER.length : i; };
  return (await res.json())
    .map(r => ({
      outlet: r.outlet,
      week: r.week,
      sales: +r.sales,
      target: +r.target,
      orders: +r.orders,
      returns: +r.returns,
    }))
    .sort((a, b) =>
      rank(a.outlet) - rank(b.outlet)
      || a.outlet.localeCompare(b.outlet)
      || a.week.localeCompare(b.week));
}
