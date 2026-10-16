// ACCDB Studio — script del sito: ricerca sui dati di esempio, controllo del file, schermate, comparse.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- comparse una volta sola, mai contenuto nascosto se l'osservatore non scatta ----------
  const targets = document.querySelectorAll('[data-reveal], .stage');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    targets.forEach((el) => io.observe(el));
    addEventListener('load', () => setTimeout(() => targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
    }), 2500));
  } else targets.forEach((el) => el.classList.add('is-in'));

  // ---------- Search database sui clienti del file di esempio (gli stessi delle schermate) ----------
  const fields = ['Company', 'Contact', 'City', 'Country', 'Since'];
  const rows = [
    ['Blue Door Café', 'Emma Clarke', 'London', 'United Kingdom', '01/01/2021'],
    ['Corner Bakery Co.', 'Lucas Silva', 'Amsterdam', 'Netherlands', '12/04/2022'],
    ['Hilltop Bistro', 'Mia Jansen', 'Stockholm', 'Sweden', '23/07/2023'],
    ['Lantern Tea Room', 'Jonas Berg', 'Berlin', 'Germany', '06/10/2024'],
    ['Morning Ritual', 'Chloé Martin', 'Vienna', 'Austria', '17/01/2021'],
    ['Northside Deli', 'Leo Rossi', 'Paris', 'France', '28/04/2022'],
    ['Old Mill Roasters', 'Isla Murphy', 'Madrid', 'Spain', '11/07/2023'],
    ['Paper Crane Café', 'Noah Becker', 'Manchester', 'United Kingdom', '22/10/2024'],
    ['Quayside Kitchen', 'Olivia Brown', 'Milan', 'Italy', '05/01/2021'],
    ['Red Brick Diner', 'Felix Dubois', 'Zurich', 'Switzerland', '16/04/2022'],
    ['Saltwater Grill', 'Sofia Marino', 'Munich', 'Germany', '27/07/2023'],
    ['The Daily Grind', 'Mateo García', 'Copenhagen', 'Denmark', '10/10/2024'],
    ['Tidewater Hotel', 'Aiko Tanaka', 'Lyon', 'France', '21/01/2021'],
    ['Two Rivers Market', 'Liam Foster', 'Lisbon', 'Portugal', '04/04/2022'],
    ['Velvet Spoon', 'Hannah Weber', 'Dublin', 'Ireland', '15/07/2023'],
    ['Wildflower Bakehouse', 'Ethan Walsh', 'Rome', 'Italy', '26/10/2024'],
    ['Amber Leaf Cafe', 'Emma Clarke', 'London', 'United Kingdom', '09/01/2021'],
    ['Brass Kettle', 'Lucas Silva', 'Amsterdam', 'Netherlands', '20/04/2022'],
  ];
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const q = document.getElementById('q');
  const hits = document.getElementById('hits');
  const head = document.getElementById('answer-head');
  const caret = document.querySelector('.caret');
  const meter = document.createElement('span');

  const placeCaret = () => {
    if (!caret) return;
    const cs = getComputedStyle(q);
    meter.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font:${cs.font};letter-spacing:${cs.letterSpacing}`;
    meter.textContent = q.value;
    document.body.appendChild(meter);
    const x = Math.min(meter.getBoundingClientRect().width - q.scrollLeft, q.clientWidth);
    meter.remove();
    caret.style.setProperty('--caret-x', `${Math.max(0, x) + 4}px`);
  };

  const run = () => {
    const term = fold(q.value.trim());
    const found = [];
    if (term) rows.forEach((r, i) => r.forEach((v, f) => {
      const at = fold(v).indexOf(term);
      if (at >= 0) found.push({ n: i + 1, f: fields[f], v, at, len: term.length });
    }));
    head.textContent = !term ? 'Type to search every table'
      : `${found.length} ${found.length === 1 ? 'match' : 'matches'} in Customers`;
    hits.innerHTML = found.slice(0, 3).map((h, k) =>
      `<li style="--n:${k}"><span class="hit-n">${h.n}</span><span class="hit-v">${esc(h.v.slice(0, h.at))}<mark>${esc(h.v.slice(h.at, h.at + h.len))}</mark>${esc(h.v.slice(h.at + h.len))}</span><span class="hit-f">${h.f}</span></li>`
    ).join('') || (term ? '<li class="none">No records contain this text. Try a city, a name, or a year.</li>' : '');
    placeCaret();
  };

  if (q) {
    q.addEventListener('input', run);
    q.addEventListener('scroll', placeCaret);
    addEventListener('resize', placeCaret);
    document.fonts?.ready.then(placeCaret);
    document.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { q.value = b.dataset.q; run(); }));
    run();
  }

  // ---------- funzioni: la schermata segue il blocco che si sta leggendo ----------
  const shots = [...document.querySelectorAll('.shot')];
  const blocks = [...document.querySelectorAll('.block')];
  const show = (i) => {
    shots.forEach((s, k) => s.classList.toggle('is-on', k === i));
    blocks.forEach((b) => b.classList.toggle('is-current', b.dataset.show === String(i)));
  };
  document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
    show(Number(b.dataset.go));
    if (innerWidth <= 1000) document.getElementById('shots').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'nearest' });
  }));
  if ('IntersectionObserver' in window) {
    const seen = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting && e.target.dataset.show !== 'keep') show(Number(e.target.dataset.show));
    }, { rootMargin: '-45% 0px -45% 0px' });
    blocks.forEach((b) => seen.observe(b));
  }

  // chiaro o scuro: cambia le schermate subito, qualunque sia l'aspetto del sistema
  const sources = document.querySelectorAll('.shot source, .inline-shot source');
  const seg = [...document.querySelectorAll('[data-theme-set]')];
  const mark = (t) => seg.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themeSet === t)));
  mark(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  seg.forEach((b) => b.addEventListener('click', () => {
    sources.forEach((s) => { s.media = b.dataset.themeSet === 'dark' ? 'all' : 'not all'; });
    mark(b.dataset.themeSet);
  }));

  // ---------- file supportati: schede ----------
  const tabs = [...document.querySelectorAll('.types [role="tab"]')];
  const pick = (i, focus = false) => {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) [...panel.children].forEach((li, n) => li.style.setProperty('--n', n));
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(i));
    t.addEventListener('keydown', (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (step) { e.preventDefault(); pick((i + step + tabs.length) % tabs.length, true); }
    });
  });

  // ---------- controllo del file: legge solo l'intestazione, qui nel browser ----------
  // Byte 4: "Standard Jet DB" o "Standard ACE DB". Byte 0x14: versione del formato.
  const formats = ['Jet 3, the Access 97 format', 'Jet 4, the Access 2000–2003 format', 'ACE 12, the Access 2007 format', 'ACE 14, the Access 2010 format'];
  const file = document.getElementById('file');
  const verdict = document.getElementById('verdict');
  const say = (html) => { verdict.innerHTML = html; verdict.hidden = false; };

  file?.addEventListener('change', async () => {
    const f = file.files[0];
    if (!f) return;
    document.querySelectorAll('.bands li.is-match').forEach((li) => li.classList.remove('is-match'));
    const bytes = new Uint8Array(await f.slice(0, 32).arrayBuffer());
    const sig = String.fromCharCode(...bytes.slice(4, 19));
    const name = esc(f.name);
    if (sig !== 'Standard Jet DB' && sig !== 'Standard ACE DB') {
      say(`<b>${name}</b> doesn’t look like an Access database. Its first bytes don’t carry the Jet or ACE signature.`);
      return;
    }
    const v = bytes[0x14];
    const what = formats[v] ?? 'ACE 15 or later, the format of Access 2013 and newer';
    say(`<b>${name}</b> is an Access database in ${what}. ACCDB Studio opens it.`);
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    const tab = tabs.findIndex((t) => t.id === `t-${ext}`);
    pick(tab >= 0 ? tab : (v <= 1 ? 1 : 0));
    if (v <= 3) document.querySelector(`.bands ul:not([hidden]) li[data-ver="${v}"]`)?.classList.add('is-match');
    file.value = '';
  });
})();
