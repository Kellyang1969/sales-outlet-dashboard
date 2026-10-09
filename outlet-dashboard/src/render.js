// Pure functions: data in, HTML string out. No DOM access here.
import { esc, money, num, pct, dayMon, dayMonYr } from './utils.js';

export const THRESHOLD = 90;   // % of target below which an outlet-week needs attention

export function filterHTML(allRows, selected) {
  const outlets = ['All', ...new Set(allRows.map(r => r.outlet))];
  return outlets.map(o =>
    `<button type="button" data-o="${esc(o)}" aria-pressed="${o === selected}">${esc(o)}</button>`
  ).join('');
}

export function periodText(rows, outlet) {
  if (!rows.length) return 'No data';
  const weeks = [...new Set(rows.map(r => r.week))].sort();
  return `${outlet === 'All' ? 'All outlets' : outlet} · weeks of ${dayMon(weeks[0])} – ${dayMonYr(weeks[weeks.length - 1])}`;
}

export function dashboardHTML(rows) {
  const sales = rows.reduce((a, r) => a + r.sales, 0);
  const target = rows.reduce((a, r) => a + r.target, 0);
  const orders = rows.reduce((a, r) => a + r.orders, 0);
  const returns = rows.reduce((a, r) => a + r.returns, 0);
  const gap = sales - target;

  const flagged = rows
    .map(r => ({ ...r, p: pct(r.sales, r.target) }))
    .filter(r => r.p < THRESHOLD)
    .sort((a, b) => a.p - b.p);

  return `
    <div class="kpis">
      <section class="card kpi"><h2>Total sales</h2>
        <div class="value">${money(sales)}</div>
        <div class="note">${money(target)} target</div></section>
      <section class="card kpi"><h2>% of target</h2>
        <div class="value">${pct(sales, target).toFixed(1)}%</div>
        <div class="note ${gap < 0 ? 'bad' : ''}">${money(Math.abs(gap))} ${gap < 0 ? 'under' : 'over'} target</div></section>
      <section class="card kpi"><h2>Orders</h2>
        <div class="value">${num(orders)}</div>
        <div class="note">${money(orders ? sales / orders : 0)} avg order</div></section>
      <section class="card kpi"><h2>Returns</h2>
        <div class="value">${pct(returns, orders).toFixed(1)}%</div>
        <div class="note">${num(returns)} of ${num(orders)} orders</div></section>
    </div>
    <div class="grid">
      <section class="card">
        <div class="card-head">
          <h2>Sales as % of target</h2>
          <div class="legend">
            <span><i style="background:var(--bar)"></i>On track</span>
            <span><i style="background:var(--bad)"></i>Below ${THRESHOLD}%</span>
            <span><i class="dash"></i>${THRESHOLD}% line</span>
          </div>
        </div>
        ${chartHTML(rows)}
      </section>
      <section class="card">
        <div class="card-head">
          <h2>Needs attention</h2>
          <span class="badge ${flagged.length ? '' : 'zero'}">${flagged.length}</span>
        </div>
        ${listHTML(flagged)}
      </section>
    </div>`;
}

function chartHTML(rows) {
  if (!rows.length) return '<div class="empty">No data for this selection.</div>';
  const H = 240;
  const maxP = Math.max(...rows.map(r => pct(r.sales, r.target)));
  const axisMax = Math.max(110, Math.ceil(maxP / 10) * 10);
  const y = v => (v / axisMax) * 100;

  const lines = [0, 25, 50, 75].map(v =>
      `<div class="gl" style="bottom:${y(v)}%"><span>${v}%</span></div>`).join('')
    + `<div class="gl target" style="bottom:${y(100)}%"><span>100%</span></div>`
    + `<div class="gl thresh" style="bottom:${y(THRESHOLD)}%"><span>${THRESHOLD}%</span></div>`;

  let prev = null;
  const cols = rows.map(r => {
    const p = pct(r.sales, r.target);
    const low = p < THRESHOLD;
    const sep = prev && prev !== r.outlet ? ' sep' : '';
    prev = r.outlet;
    const tip = `${r.outlet}, week of ${dayMon(r.week)}: ${money(r.sales)} of ${money(r.target)} (${p.toFixed(1)}%)`;
    return `<div class="col${sep}" title="${esc(tip)}" aria-label="${esc(tip)}">
      <div class="area">
        <div class="bar${low ? ' low' : ''}" style="height:${y(p)}%"></div>
        <div class="val${low ? ' low' : ''}" style="bottom:calc(${y(p)}% + 4px)">${p.toFixed(0)}%</div>
      </div>
      <div class="xl"><b>${esc(r.outlet)}</b>${dayMon(r.week)}</div>
    </div>`;
  }).join('');

  return `<div class="scroll"><div class="chart" style="--h:${H}px">
    <div class="plot-lines">${lines}</div>
    <div class="cols">${cols}</div>
  </div></div>`;
}

function listHTML(flagged) {
  if (!flagged.length) return `<div class="empty">Every outlet-week is at or above ${THRESHOLD}% of target.</div>`;
  return `<ul class="list">${flagged.map(r => `
    <li>
      <div>
        <div class="who">${esc(r.outlet)} · week of ${dayMon(r.week)}</div>
        <div class="meta">${money(r.sales)} of ${money(r.target)} · ${money(r.target - r.sales)} short</div>
      </div>
      <span class="pill">${r.p.toFixed(1)}%</span>
    </li>`).join('')}</ul>`;
}

export function loadingHTML() {
  return '<div class="status">Loading data…</div>';
}

export function emptyHTML() {
  return '<div class="status">No data yet. Add rows to the <code>outlet_weekly</code> table in Supabase.</div>';
}

export function errorHTML(message) {
  return `<div class="card error" role="alert">
    <h2>Couldn’t load data</h2>
    <p>${esc(message)}</p>
    <button type="button" class="retry" data-retry>Retry</button>
  </div>`;
}
