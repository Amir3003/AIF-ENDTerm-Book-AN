/* Page assembly and the JS flip engine.

   The book is 12 leaves = 24 pages. A leaf has a front (right-hand page while unturned)
   and a back (left-hand page once turned). k = number of turned leaves:
     k=0  closed, front cover     k=1  inside cover + contents
     k=n+1  week n spread         k=12 closed, back cover
   Leaf 0 and leaf 11 are the hardcover boards. */
(function () {
  const W = 600, H = 840;
  const LEAVES = 12, DZ = 2.8, BOARD = 6;
  const DUR = 860, STAGGER = 75;
  const CLOSED = { rx: 24, ry: 26, rz: -7 };   /* resting pose of the closed book */
  const BACK = { rx: 3, ry: -5, rz: 0 };

  const { weeks, insideFront } = window.BOOK;
  const $ = (s, r = document) => r.querySelector(s);
  const book = $('#book'), scene = $('#scene');

  /* ---------- math ---------- */
  function tex(html) {
    const render = (src, displayMode) => katex.renderToString(src.replace(/&lt;/g, '<').replace(/&gt;/g, '>'), { displayMode, throwOnError: false, strict: false });
    /* inline math stays glued to adjacent brackets and punctuation so a line never starts with "," */
    return html.replace(/\$\$([\s\S]+?)\$\$|(\(?)\$([^$\n]+?)\$([.,;:)]*)/g, (_, d, open, i, close) =>
      d ? render(d, true) : `<span class="nb">${open}${render(i, false)}${close}</span>`);
  }

  /* ---------- cover motif: a graph with the optimal A* route picked out in foil ---------- */
  function coverGraph() {
    let seed = 20261;
    const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const cols = 7, rows = 10, nodes = [], edges = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) nodes.push({
      x: (c + .5 + (rnd() - .5) * .55) / cols, y: (r + .5 + (rnd() - .5) * .55) / rows
    });
    const id = (r, c) => r * cols + c;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (c < cols - 1 && rnd() < .62) edges.push([id(r, c), id(r, c + 1)]);
      if (r < rows - 1 && rnd() < .62) edges.push([id(r, c), id(r + 1, c)]);
      if (r < rows - 1 && c < cols - 1 && rnd() < .26) edges.push([id(r, c), id(r + 1, c + 1)]);
    }
    /* route up the right-hand margin, clear of the cover text */
    const path = [[9, 5], [9, 6], [8, 6], [7, 6], [6, 6], [5, 6], [4, 6], [3, 6], [2, 6], [1, 5], [0, 6]].map(([r, c]) => id(r, c));
    return { nodes, edges, path };
  }
  const GRAPH = coverGraph();

  function motifSVG(route = true) {
    const X = n => (n.x * 608).toFixed(1), Y = n => (n.y * 856).toFixed(1), g = GRAPH;
    const seg = (a, b) => `M${X(g.nodes[a])} ${Y(g.nodes[a])}L${X(g.nodes[b])} ${Y(g.nodes[b])}`;
    const d = g.edges.map(([a, b]) => seg(a, b)).join('');
    const p = g.path.map((n, i) => (i ? 'L' : 'M') + X(g.nodes[n]) + ' ' + Y(g.nodes[n])).join('');
    const dots = g.nodes.map(n => `<circle cx="${X(n)}" cy="${Y(n)}" r="2.6"/>`).join('');
    const on = g.path.map(i => `<circle cx="${X(g.nodes[i])}" cy="${Y(g.nodes[i])}" r="3.6"/>`).join('');
    return `<svg class="motif" viewBox="0 0 608 856" preserveAspectRatio="none" aria-hidden="true">
      <g transform="translate(0 1)" fill="none" stroke="#000" stroke-opacity=".75" stroke-width="1.2"><path d="${d}"/></g>
      <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".085" stroke-width="1.2"/>
      <g fill="#2a2a2e" stroke="#000" stroke-opacity=".6">${dots}</g>
      ${route ? `<path d="${p}" fill="none" stroke="#d9b384" stroke-opacity=".6" stroke-width="1.5"/>
      <g fill="#d9b384" fill-opacity=".85">${on}</g>` : ''}</svg>`;
  }

  /* ---------- pages ---------- */
  const twoDigit = n => String(n).padStart(2, '0');
  const PAGES = [];           /* index = printed page number; PAGES[p] = {html, label, dark} */
  const frame = (side, p, inner) => `<div class="pg ${side}"><div class="pg-in">${inner}</div><div class="folio"><span>AI Fundamentals</span><span>${p}</span></div></div>`;

  const TOC_SUB = [
    'PEAS, rationality, four agent architectures. Task: a delivery drone.',
    'BFS, DFS, UCS, Greedy, A*. Task: frontier trace on a routing graph.',
    'Minimax, Alpha-Beta, Expectiminimax. Task: pruning a 2-ply tree.',
    'MRV, Degree, LCV, Forward Checking, AC-3. Task: map coloring.',
    'Entailment, CNF, Resolution. Task: a Wumpus World safety proof.',
    'Quantifiers, Bayes\' Rule, Bayesian Networks. Task: a medical test.',
    'ERM, MSE, Gradient Descent, regularization. Task: one step by hand.',
    'Logistic Regression, Entropy, F1. Task: root split and evaluation.',
    'MLP, activations, Backpropagation. Task: solving XOR.',
    'Self-Attention, temperature, RAG. Task: tracing attention weights.'
  ];
  const contents = `
    <div class="eyebrow"><span>Contents</span><span>Weeks 1 to 10</span></div>
    <h2 class="ptitle">Contents</h2>
    <ol class="toc">${weeks.map((w, i) => `<li><button type="button" data-goto="${w.n + 1}"><span class="no">W${twoDigit(w.n)}</span><span>${w.title}<small>${TOC_SUB[i]}</small></span><span class="pp">p. ${2 + w.n * 2}</span></button></li>`).join('')}
    <li><button type="button" data-goto="12"><span class="no">End</span><span>You Reached the Goal State!<small>Back cover: leave a review of this book.</small></span><span class="pp">p. 24</span></button></li></ol>`;

  PAGES[1] = { label: 'Front Cover', dark: true, html: `
    <button class="front-cover" type="button" data-goto="1" aria-label="Open book"><div class="cover">${motifSVG()}<div class="hinge"></div>
      <div class="cv"><div class="cv-kicker">ENDTERM ASSIGNMENT</div>
      <h1 class="foil"><span>AI</span> FUNDAMENTALS</h1>
      <div class="cv-sub">Endterm Book: Complete 10-Week Engineering Compendium</div>
      <div class="cv-foot"><div class="cv-author foil">Amir Nagiyev</div>
      <div class="cv-aff">BSc in Artificial Intelligence &amp; Machine Learning • Qazaq AI Research University (QAIRU)</div>
      <div class="badge">Click or press → to open book</div></div></div></div></button>` };
  PAGES[2] = { label: 'How This Book Works', html: frame('left', 2, tex(insideFront)) };
  PAGES[3] = { label: 'Contents', html: frame('right', 3, contents) };
  weeks.forEach(w => {
    const l = 2 + w.n * 2, r = l + 1;
    PAGES[l] = { label: `Week ${w.n} Lecture: ${w.plain}`, html: frame('left', l, tex(`
      <div class="eyebrow"><span>Week ${twoDigit(w.n)}</span><span>Lecture &amp; Theory</span></div>
      <h2 class="ptitle">${w.title}</h2>${w.lecture}`)) };
    PAGES[r] = { label: `Week ${w.n} Practice: ${w.practiceTitle}`, html: frame('right', r, tex(`
      <div class="eyebrow"><span>Week ${twoDigit(w.n)}</span><span>Practice &amp; Tasks</span></div>
      <h2 class="ptitle">${w.practiceTitle}</h2>${w.practice}`)) };
  });
  PAGES[24] = { label: 'Back Cover', dark: true, html: `
    <div class="backcover">${motifSVG(false)}<div class="goal-mark" aria-hidden="true">G</div>
    <h2 class="foil">You Reached the Goal State!</h2>
    <p class="joke">Thanks for reading all the way to Week 10! No Depth-First Search agents were trapped in infinite loops during the making of this book, and my heuristic function says this project deserves full marks.</p>
    <div data-review></div>
    <div class="sign"><span>Built by Amir Nagiyev • QAIRU AI &amp; ML • Astana, 2026</span></div></div>` };

  /* ---------- 3D DOM ---------- */
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

  const leaves = [];
  function makeFace(side, p, board) {
    const f = el('section', 'face ' + side);
    f.dataset.page = p;
    const page = PAGES[p];
    const body = (board && !page.dark) ? `<div class="sheet-in">${page.html}<div class="gutter"></div></div>` : page.html + (page.dark ? '' : '<div class="gutter"></div>');
    f.innerHTML = body + '<div class="shade"></div>';
    /* a turn corner on every page except the front cover, which opens as a whole */
    if (p > 1) {
      const cnr = el('button', 'corner ' + (side === 'front' ? 'nx' : 'pv') + (page.dark ? ' on-board' : ''), '<i></i>');
      cnr.type = 'button';
      const isNext = side === 'front';
      cnr.setAttribute('aria-label', isNext ? 'Next page' : 'Previous page');
      cnr.addEventListener('click', e => { e.stopPropagation(); isNext ? next() : prev(); });
      f.appendChild(cnr);
    }
    return f;
  }
  for (let i = 0; i < LEAVES; i++) {
    const board = i === 0 || i === LEAVES - 1;
    const leaf = el('div', 'leaf ' + (board ? 'board' : 'paper'));
    leaf.dataset.i = i;
    const front = makeFace('front', 2 * i + 1, board), back = makeFace('back', 2 * i + 2, board);
    leaf.append(front, back);
    if (board) leaf.insertAdjacentHTML('beforeend', '<div class="thick b"></div><div class="thick t"></div><div class="thick o"></div>');
    book.appendChild(leaf);
    leaves.push({ el: leaf, front, back, board, shadeF: $('.shade', front), shadeB: $('.shade', back), p: 0, tw: null });
  }
  const layers = { r: [], l: [] };
  ['r', 'l'].forEach(s => { for (let j = 1; j <= 4; j++) { const e = el('div', `layer layer${j} ${s}`); book.appendChild(e); layers[s].push(e); } });
  const edges = { br: el('div', 'edge bottom r'), bl: el('div', 'edge bottom l'), fr: el('div', 'edge fore r'), fl: el('div', 'edge fore l') };
  Object.values(edges).forEach(e => book.appendChild(e));
  const SPINE_TXT = 'AI FUNDAMENTALS &nbsp; A. NAGIYEV';
  const spines = [el('div', 'spine', SPINE_TXT), el('div', 'spine', SPINE_TXT)];
  spines[0].style.transform = 'translate3d(-.8px,0,20px) rotateY(-90deg)';
  spines[1].style.transform = 'translate3d(.8px,0,20px) rotateY(90deg)';
  spines.forEach(s => book.appendChild(s));

  /* ---------- geometry per frame ---------- */
  const zRight = i => i === 0 ? 40 : i === 11 ? BOARD : BOARD + (11 - i) * DZ;
  const zLeft = i => i === 0 ? 0 : i === 11 ? 34 : BOARD + i * DZ;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let scale = 1, narrow = false, k = 0, page = 1, viewShift = -W / 2;
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

  function paint() {
    const p0 = leaves[0].p, p11 = leaves[11].p;
    const closedF = 1 - p0, closedB = p11;
    const rx = CLOSED.rx * closedF + BACK.rx * closedB + tilt.y * -5 * closedF;
    const ry = CLOSED.ry * closedF + BACK.ry * closedB + tilt.x * 7 * closedF;
    const rz = CLOSED.rz * closedF + BACK.rz * closedB;
    const desk = -closedF * W / 2 + closedB * W / 2;
    const shift = narrow ? viewShift : desk;
    book.style.transform = `scale3d(${scale},${scale},${scale}) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) translate3d(${shift.toFixed(2)}px,0,-20px)`;

    let sumR = 0, sumL = 0;
    for (let i = 1; i <= 10; i++) { sumR += 1 - leaves[i].p; sumL += leaves[i].p; }
    const topR = BOARD + DZ * sumR, topL = BOARD + DZ * sumL;

    /* which paper leaves can be seen: anything in motion plus the top of each stack */
    let lastTurned = -1, firstUnturned = LEAVES;
    leaves.forEach((l, i) => { if (l.p >= 1) lastTurned = i; });
    for (let i = LEAVES - 1; i >= 0; i--) if (leaves[i].p <= 0) firstUnturned = i;

    const closed = p0 === 0 || p11 === 1;
    leaves[11].front.style.visibility = p0 === 0 ? 'hidden' : '';
    leaves[0].back.style.visibility = p11 === 1 ? 'hidden' : '';
    leaves.forEach((l, i) => {
      const moving = l.p > 0 && l.p < 1;
      /* a closed book shows only its boards: nothing inside may cross the spine plane and leave a seam */
      const vis = l.board || (!closed && (moving || i === lastTurned || i === firstUnturned));
      l.el.style.visibility = vis ? '' : 'hidden';
      if (!vis) return;
      const s = Math.sin(Math.PI * l.p);
      const z = lerp(zRight(i), zLeft(i), l.p) + s * (l.board ? 0 : 7);
      const skew = l.board ? 0 : s * 1.7;
      l.el.style.transform = `translateZ(${z.toFixed(2)}px) rotateY(${(-180 * l.p).toFixed(2)}deg) skewY(${skew.toFixed(2)}deg)`;
      l.shadeF.style.opacity = moving ? (.62 * s).toFixed(3) : 0;
      l.shadeB.style.opacity = moving ? (.62 * s).toFixed(3) : 0;
    });
    /* the turning leaf casts onto the two pages it passes over */
    const mover = leaves.findIndex(l => l.p > 0 && l.p < 1);
    if (mover >= 0) {
      const s = Math.sin(Math.PI * leaves[mover].p);
      const under = leaves.slice(mover + 1).find(l => l.p < 1);
      const over = leaves.slice(0, mover).reverse().find(l => l.p > 0);
      if (under && under.p === 0) under.shadeF.style.opacity = (.5 * s).toFixed(3);
      if (over && over.p === 1) over.shadeB.style.opacity = (.5 * s).toFixed(3);
    }

    /* layer1..layer4 fill the block between the board and the top sheet */
    const place = (arr, top, side) => {
      const h = top - BOARD;
      arr.forEach((e, j) => {
        const shown = !closed && h > (j + .4) * (28 / 5);
        e.style.visibility = shown ? '' : 'hidden';
        if (shown) e.style.transform = `translate3d(0,0,${(BOARD + (j + 1) * h / 5).toFixed(2)}px)`;
      });
    };
    place(layers.r, topR); place(layers.l, topL);

    const hR = topR - BOARD, hL = topL - BOARD;
    edges.br.style.height = edges.fr.style.width = hR + 'px';
    edges.bl.style.height = edges.fl.style.width = hL + 'px';
    edges.br.style.transform = `translateZ(${topR}px) rotateX(-90deg)`;
    edges.bl.style.transform = `translateZ(${topL}px) rotateX(-90deg)`;
    edges.fr.style.transform = `translateZ(${topR}px) rotateY(90deg)`;
    edges.fl.style.transform = `translateZ(${BOARD}px) rotateY(-90deg)`;
    const showE = (e, h) => e.style.visibility = h > .2 ? '' : 'hidden';
    showE(edges.br, hR); showE(edges.fr, hR); showE(edges.bl, hL); showE(edges.fl, hL);
  }

  /* ---------- the engine: one rAF loop drives every tween ---------- */
  let raf = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function loop(now) {
    raf = 0;
    let busy = false;
    leaves.forEach(l => {
      if (!l.tw) return;
      const t = Math.min(1, Math.max(0, (now - l.tw.t0) / l.tw.dur));
      if (now >= l.tw.t0) l.p = lerp(l.tw.from, l.tw.to, ease(t));
      if (t >= 1 && now >= l.tw.t0) { l.p = l.tw.to; l.tw = null; } else busy = true;
    });
    if (narrow) {
      const target = pageShift();
      const d = target - viewShift;
      if (Math.abs(d) > .4) { viewShift += d * .16; busy = true; } else viewShift = target;
    }
    const dx = tilt.tx - tilt.x, dy = tilt.ty - tilt.y;
    if (Math.abs(dx) + Math.abs(dy) > .002) { tilt.x += dx * .08; tilt.y += dy * .08; busy = true; }
    paint();
    if (busy) kick(); else settled();
  }
  /* rAF stops in a hidden tab, so a timer finishes any turn that is in progress */
  function kick() {
    if (raf) return;
    raf = document.hidden ? setTimeout(() => loop(performance.now()), 32) : requestAnimationFrame(loop);
  }
  function settled() { updateInert(); }

  function flipTo(target) {
    const now = performance.now();
    const order = [];
    for (let i = 0; i < LEAVES; i++) {
      const want = i < target ? 1 : 0;
      if (leaves[i].p !== want || leaves[i].tw) {
        if (!leaves[i].tw || leaves[i].tw.to !== want) order.push([i, want]);
      }
    }
    if (target < k) order.reverse();
    const stag = order.length > 1 ? Math.min(STAGGER, 620 / order.length) : 0;
    order.forEach(([i, want], n) => {
      const l = leaves[i];
      const span = reduced ? 1 : DUR * Math.max(.45, Math.abs(want - l.p));
      l.tw = { from: l.p, to: want, t0: now + n * (reduced ? 0 : stag), dur: span };
    });
    k = target;
    kick();
  }

  /* ---------- navigation ---------- */
  const pageShift = () => (page % 2 === 0 ? W / 2 : -W / 2);
  const leftOf = kk => 2 * kk, rightOf = kk => 2 * kk + 1;

  function goK(target, opts = {}) {
    target = Math.max(0, Math.min(LEAVES, target));
    page = opts.page || (target === 0 ? 1 : target === LEAVES ? 24 : rightOf(target));
    if (!opts.page && target > 0 && target < LEAVES && narrow) page = leftOf(target);
    flipTo(target);
    updateChrome();
    if (narrow) kick();
  }
  function goPage(p) {
    p = Math.max(1, Math.min(24, p));
    goK(Math.floor(p / 2), { page: p });
  }
  function next() {
    if (narrow) return goPage(page + 1);
    if (k < LEAVES) goK(k + 1);
  }
  function prev() {
    if (narrow) return goPage(page - 1);
    if (k > 0) goK(k - 1);
  }

  /* ---------- chrome ---------- */
  const jump = $('#jump');
  const targets = [['Cover', 0], ...weeks.map(w => [`W${w.n}`, w.n + 1]), ['Back Cover', LEAVES]];
  targets.forEach(([t, kk]) => {
    const b = el('button'); b.type = 'button'; b.textContent = t; b.dataset.k = kk;
    b.addEventListener('click', () => goK(kk));
    jump.appendChild(b);
  });
  const whereText = () => {
    if (k === 0) return 'p. 1 · Front Cover';
    if (k === LEAVES) return 'p. 24 · Back Cover';
    if (narrow) return `p. ${page} · ${PAGES[page].label}`;
    if (k === 1) return 'pp. 2-3 · Front Matter';
    return `pp. ${leftOf(k)}-${rightOf(k)} · Week ${k - 1}: ${weeks[k - 2].plain}`;
  };
  function updateChrome() {
    $('#where').textContent = whereText();
    jump.querySelectorAll('button').forEach(b => {
      const on = +b.dataset.k === k;
      b.setAttribute('aria-current', on);
      if (on) b.scrollIntoView({ inline: 'center', block: 'nearest' });
    });
    $('#prev').disabled = narrow ? page === 1 : k === 0;
    $('#next').disabled = narrow ? page === 24 : k === LEAVES;
    $('#readBtn').disabled = k === 0;
    const id = k === 0 ? 'cover' : k === 1 ? 'contents' : k === LEAVES ? 'back' : 'w' + (k - 1);
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* some file:// contexts refuse */ }
    updateInert();
  }
  /* pages out of view must not take keyboard focus */
  function updateInert() {
    leaves.forEach((l, i) => {
      l.front.inert = !(i === k);
      l.back.inert = !(i === k - 1);
    });
  }

  /* ---------- reader ---------- */
  const reader = $('#reader'), rBody = $('#rBody');
  let rPage = 2;
  function renderReader(p) {
    rPage = Math.max(2, Math.min(24, p));
    rBody.innerHTML = PAGES[rPage].html;
    rBody.classList.toggle('dark', !!PAGES[rPage].dark);
    rBody.scrollTop = 0;
    rBody.querySelectorAll('.t').forEach(t => { const w = el('div', 'scrollx'); t.replaceWith(w); w.appendChild(t); });
    const mount = $('[data-review]', rBody);
    if (mount && window.mountReview) window.mountReview(mount);
    $('#rWhere').textContent = `p. ${rPage} of 24`;
    $('#rPrev').disabled = rPage === 2;
    $('#rNext').disabled = rPage === 24;
  }
  function openReader(p) {
    renderReader(p);
    if (!reader.open) reader.showModal();
    rBody.focus?.();
  }
  $('#readBtn').addEventListener('click', () => openReader(narrow ? page : (k === LEAVES ? 24 : leftOf(k))));
  $('#rClose').addEventListener('click', () => reader.close());
  const stepReader = d => { renderReader(rPage + d); goPage(rPage); };
  $('#rPrev').addEventListener('click', () => stepReader(-1));
  $('#rNext').addEventListener('click', () => stepReader(1));
  reader.addEventListener('click', e => { if (e.target === reader) reader.close(); });

  /* ---------- input ---------- */
  $('#prev').addEventListener('click', prev);
  $('#next').addEventListener('click', next);
  book.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]');
    if (g) {
      if (reader.open) reader.close();
      goK(+g.dataset.goto);
      return;
    }
    /* phones: the book is an overview, a tap opens the page at a readable size */
    if (narrow && !e.target.closest('button,textarea,input,label')) {
      const f = e.target.closest('.face');
      if (f && +f.dataset.page > 1) openReader(+f.dataset.page);
    }
  });
  rBody.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]');
    if (g) { reader.close(); goK(+g.dataset.goto); }
  });
  book.addEventListener('dblclick', e => {
    if (e.target.closest('button,textarea,input,label,.review')) return;
    const f = e.target.closest('.face');
    if (f && +f.dataset.page > 1) { getSelection()?.removeAllRanges(); openReader(+f.dataset.page); }
  });
  addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]')) {
      if (reader.open && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        if (e.key === 'ArrowRight') stepReader(1);
        if (e.key === 'ArrowLeft') stepReader(-1);
      }
      return;
    }
    if (e.target.closest && e.target.closest('input,textarea,[role=radiogroup]')) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); goK(0); }
    else if (e.key === 'End') { e.preventDefault(); goK(LEAVES); }
  });
  scene.addEventListener('pointermove', e => {
    if (narrow || e.pointerType === 'touch' || k !== 0) return;
    const r = scene.getBoundingClientRect();
    tilt.tx = (e.clientX - r.left) / r.width * 2 - 1;
    tilt.ty = (e.clientY - r.top) / r.height * 2 - 1;
    kick();
  });
  scene.addEventListener('pointerleave', () => { tilt.tx = tilt.ty = 0; kick(); });

  /* ---------- layout ---------- */
  function fit() {
    const was = narrow;
    narrow = innerWidth < 820 || innerWidth / innerHeight < 1.05;
    const r = scene.getBoundingClientRect();
    const availW = narrow ? r.width - 20 : r.width - 40;
    const availH = r.height - 34;
    const needW = narrow ? W + 2 * 8 : 2 * W + 2 * 16;
    scale = Math.min(1.6, availW / needW, availH / (H + 24));
    if (narrow !== was) {
      if (narrow) { page = k === 0 ? 1 : k === LEAVES ? 24 : leftOf(k); viewShift = pageShift(); }
      updateChrome();
    }
    paint();
  }
  addEventListener('resize', fit);

  /* ---------- typographic fit: both pages of a spread share the largest size that fits ---------- */
  function fitPages() {
    const spreads = {};
    book.querySelectorAll('.pg').forEach(pg => {
      const n = +pg.closest('.face').dataset.page;
      (spreads[Math.floor(n / 2)] = spreads[Math.floor(n / 2)] || []).push({ n, pg, box: pg.querySelector('.pg-in') });
    });
    const report = [];
    Object.values(spreads).forEach(list => {
      let fs = 14.4;
      const set = () => list.forEach(x => x.pg.style.setProperty('--fs', fs.toFixed(1) + 'px'));
      const over = () => list.some(x => x.box.scrollHeight > x.box.clientHeight + 1);
      set();
      while (over() && fs > 10.4) { fs -= .1; set(); }
      list.forEach(x => report.push({ page: x.n, fs: +fs.toFixed(1), over: x.box.scrollHeight - x.box.clientHeight }));
    });
    window.__fit = report;
  }

  /* ---------- public + boot ---------- */
  window.BookApp = { goK, goPage, W, H, GRAPH, weeks, toast: null, state: () => ({ k, page, narrow, scale }) };

  const fromHash = () => {
    const h = location.hash.slice(1);
    if (h === 'contents') return 1;
    if (h === 'back') return LEAVES;
    const m = /^w(\d+)$/.exec(h);
    return m && +m[1] >= 1 && +m[1] <= 10 ? +m[1] + 1 : 0;
  };
  function boot() {
    fit();
    const start = fromHash();
    leaves.forEach((l, i) => { l.p = i < start ? 1 : 0; });
    k = start;
    page = k === 0 ? 1 : k === LEAVES ? 24 : narrow ? leftOf(k) : rightOf(k);
    if (narrow) viewShift = pageShift();
    updateChrome();
    paint();
    const faces = ['400 13px "IBM Plex Serif"', '600 13px "IBM Plex Serif"', '400 13px "IBM Plex Mono"', '500 13px "IBM Plex Mono"', '500 13px "IBM Plex Sans"', '600 13px "IBM Plex Sans"', '400 13px KaTeX_Main', '400 13px KaTeX_Math'];
    Promise.all(faces.map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(fitPages, fitPages);
  }
  /* the review widget mounts from review.js, once it has loaded */
  addEventListener('DOMContentLoaded', boot);
})();
