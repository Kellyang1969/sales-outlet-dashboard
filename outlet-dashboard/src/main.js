import './style.css';
import { loadData } from './data.js';
import { filterHTML, periodText, dashboardHTML, loadingHTML, emptyHTML, errorHTML } from './render.js';

const state = { rows: [], outlet: 'All' };
const $ = id => document.getElementById(id);

const visibleRows = () =>
  state.outlet === 'All' ? state.rows : state.rows.filter(r => r.outlet === state.outlet);

function draw() {
  const rows = visibleRows();
  $('filter').innerHTML = filterHTML(state.rows, state.outlet);
  $('period').textContent = periodText(rows, state.outlet);
  $('app').innerHTML = state.rows.length ? dashboardHTML(rows) : emptyHTML();
}

async function load() {
  $('filter').innerHTML = '';
  $('period').textContent = 'Loading…';
  $('app').innerHTML = loadingHTML();
  try {
    state.rows = await loadData();
    if (state.outlet !== 'All' && !state.rows.some(r => r.outlet === state.outlet)) state.outlet = 'All';
    draw();
  } catch (err) {
    $('period').textContent = 'Could not load data';
    $('app').innerHTML = errorHTML(err.message);
  }
}

$('filter').addEventListener('click', e => {
  const b = e.target.closest('button[data-o]');
  if (!b) return;
  state.outlet = b.dataset.o;
  draw();
});

$('app').addEventListener('click', e => {
  if (e.target.closest('[data-retry]')) load();
});

load();
