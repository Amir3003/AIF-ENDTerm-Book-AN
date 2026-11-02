/* Exhibition card: drawn directly on a 1920x1080 canvas so text and QR modules stay sharp. */
(function () {
  const dlg = document.getElementById('poster'), cv = document.getElementById('posterCanvas'),
    input = document.getElementById('deployUrl'), hint = document.getElementById('pHint'),
    dl = document.getElementById('pDownload');
  const ctx = cv.getContext('2d');
  const { GRAPH, weeks } = window.BookApp;
  const SAVE = 'aif-book-deploy-url';
  const SANS = '"IBM Plex Sans"', SERIF = '"IBM Plex Serif"', MONO = '"IBM Plex Mono"';
  const C = { bg: '#09090b', line: '#27272a', text: '#e9e3d6', mute: '#a1a1aa', foil: '#d9b384', foil2: '#a87f4f', paper: '#f3efe5', ink: '#1b1a18' };

  function normalize(raw) {
    const s = raw.trim();
    if (!s) return '';
    try {
      const u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : 'https://' + s);
      return /^https?:$/.test(u.protocol) && u.hostname.includes('.') || /^(localhost|127\.)/.test(u.hostname) ? u.href : '';
    } catch (e) { return ''; }
  }
  function makeQR(text) {
    if (!text) return null;
    try { const q = qrcode(0, 'Q'); q.addData(text); q.make(); return q; } catch (e) { return null; }
  }

  function foilGrad(x0, y0, x1, y1) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, '#a87f4f'); g.addColorStop(.38, '#ecd2ab'); g.addColorStop(.62, '#b98f5c'); g.addColorStop(1, '#e6c79c');
    return g;
  }

  /* closed hardcover, drawn as an affine parallelogram with spine and page block */
  function drawBook(x, y, w, h) {
    const skx = .14, sky = -.09, depth = 54;
    const P = (u, v) => [x + u * w + v * h * skx, y + v * h + u * w * sky];
    const poly = pts => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); };

    /* soft ground glow */
    const [cx, cy] = P(.5, .55);
    const glow = ctx.createRadialGradient(cx, cy, 80, cx, cy, 620);
    glow.addColorStop(0, 'rgba(217,179,132,.13)'); glow.addColorStop(1, 'rgba(217,179,132,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1000, 1080);

    /* spine */
    const a = P(0, 0), b = P(0, 1), dx = -depth * .86, dy = depth * .5;
    poly([a, b, [b[0] + dx, b[1] + dy], [a[0] + dx, a[1] + dy]]);
    const sp = ctx.createLinearGradient(a[0] + dx, 0, a[0], 0);
    sp.addColorStop(0, '#0c0c0e'); sp.addColorStop(.5, '#2a2a2f'); sp.addColorStop(1, '#101012');
    ctx.fillStyle = sp; ctx.fill();

    /* page block along the bottom edge */
    const c = P(1, 1);
    poly([b, c, [c[0] + dx, c[1] + dy], [b[0] + dx, b[1] + dy]]);
    ctx.fillStyle = '#d9d3c2'; ctx.fill();
    ctx.strokeStyle = 'rgba(60,50,30,.35)'; ctx.lineWidth = 1;
    for (let t = .14; t < .9; t += .08) {
      ctx.beginPath(); ctx.moveTo(b[0] + dx * t, b[1] + dy * t); ctx.lineTo(c[0] + dx * t, c[1] + dy * t); ctx.stroke();
    }
    /* lower board */
    poly([[b[0] + dx, b[1] + dy], [c[0] + dx, c[1] + dy], [c[0] + dx, c[1] + dy + 8], [b[0] + dx, b[1] + dy + 8]]);
    ctx.fillStyle = '#26262a'; ctx.fill();

    /* front board, drawn in cover space */
    ctx.save();
    ctx.transform(w, w * sky, h * skx, h, x, y);
    ctx.beginPath(); ctx.rect(0, 0, 1, 1); ctx.clip();
    const g = ctx.createLinearGradient(0, 0, 1, 1);
    g.addColorStop(0, '#1b1b1f'); g.addColorStop(.6, '#0f0f11'); g.addColorStop(1, '#17171a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1, 1);
    ctx.lineWidth = 1.2 / w;
    ctx.strokeStyle = 'rgba(255,255,255,.1)';
    GRAPH.edges.forEach(([m, n]) => { ctx.beginPath(); ctx.moveTo(GRAPH.nodes[m].x, GRAPH.nodes[m].y); ctx.lineTo(GRAPH.nodes[n].x, GRAPH.nodes[n].y); ctx.stroke(); });
    ctx.strokeStyle = 'rgba(217,179,132,.7)'; ctx.lineWidth = 2 / w;
    ctx.beginPath(); GRAPH.path.forEach((i, n) => { const p = GRAPH.nodes[i]; n ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }); ctx.stroke();
    ctx.fillStyle = C.foil;
    GRAPH.path.forEach(i => { const p = GRAPH.nodes[i]; ctx.beginPath(); ctx.ellipse(p.x, p.y, 4.5 / w, 4.5 / h, 0, 0, 7); ctx.fill(); });
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(.028, 0, .012, 1);
    ctx.restore();

    /* cover text */
    ctx.save();
    ctx.transform(1, sky * w / w, skx, 1, x, y);
    ctx.fillStyle = foilGrad(0, 0, w, 300);
    ctx.textBaseline = 'alphabetic';
    ctx.font = `600 124px ${SANS}`;
    ctx.fillText('AI', 58, 215);
    ctx.font = `600 47px ${SANS}`;
    ctx.fillText('FUNDAMENTALS', 58, 281);
    ctx.fillStyle = '#d8d2c5'; ctx.font = `400 21px ${SERIF}`;
    ctx.fillText('Endterm Book: Complete 10-Week', 58, 336); ctx.fillText('Engineering Compendium', 58, 366);
    ctx.fillStyle = foilGrad(0, 0, w, 100); ctx.font = `500 25px ${SANS}`;
    ctx.fillText('Amir Nagiyev', 58, h - 62);
    ctx.restore();
  }

  function fitText(text, font, maxW, start, min) {
    let s = start;
    do { ctx.font = font.replace('$', s); if (ctx.measureText(text).width <= maxW) break; s -= 1; } while (s > min);
    return s;
  }

  function draw() {
    const url = normalize(input.value);
    const q = makeQR(url);
    const W = 1920, H = 1080;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    /* faint grid */
    ctx.strokeStyle = 'rgba(255,255,255,.028)'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }

    drawBook(170, 200, 500, 700);

    /* right column */
    const X = 800, R = 1840;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = C.foil; ctx.font = `500 22px ${MONO}`;
    ctx.fillText('AI FUNDAMENTALS ENDTERM EXHIBITION', X, 112);
    ctx.fillStyle = C.text; ctx.font = `600 72px ${SANS}`;
    ctx.fillText('AI Fundamentals —', X, 200);
    ctx.fillText('Interactive 3D Book', X, 282);
    ctx.font = `500 34px ${SANS}`; ctx.fillStyle = foilGrad(X, 0, X + 300, 0);
    ctx.fillText('Amir Nagiyev', X, 346);
    ctx.font = `400 21px ${MONO}`; ctx.fillStyle = C.mute;
    ctx.fillText('BSc in AI & ML • Qazaq AI Research University (QAIRU)', X, 384);

    ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X, 420); ctx.lineTo(R, 420); ctx.stroke();

    /* week list */
    const listW = 620;
    ctx.fillStyle = C.foil; ctx.font = `500 20px ${MONO}`;
    ctx.fillText('10 WEEKS, 24 PAGES, ONE AGENT', X, 466);
    weeks.forEach((w, i) => {
      const y = 516 + i * 49;
      ctx.fillStyle = C.foil; ctx.font = `500 22px ${MONO}`;
      ctx.fillText('W' + String(w.n).padStart(2, '0'), X, y);
      const s = fitText(w.plain, `400 $px ${SERIF}`, listW - 72, 25, 18);
      ctx.font = `400 ${s}px ${SERIF}`; ctx.fillStyle = C.text;
      ctx.fillText(w.plain, X + 68, y);
    });

    /* QR */
    const tile = 396, tx = R - tile, ty = 462;
    if (q) {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(tx, ty, tile, tile, 14); ctx.fill();
      const n = q.getModuleCount(), quiet = 4, m = Math.floor(tile / (n + quiet * 2));
      const off = Math.floor((tile - m * n) / 2);
      ctx.fillStyle = '#000';
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) ctx.fillRect(tx + off + c * m, ty + off + r * m, m, m);
    } else {
      ctx.setLineDash([10, 8]); ctx.strokeStyle = '#52525b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(tx + 1, ty + 1, tile - 2, tile - 2, 14); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.mute; ctx.font = `400 22px ${SANS}`; ctx.textAlign = 'center';
      ctx.fillText('Enter the deploy URL', tx + tile / 2, ty + tile / 2 - 6);
      ctx.fillText('to generate the QR code', tx + tile / 2, ty + tile / 2 + 26);
      ctx.textAlign = 'left';
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = C.text; ctx.font = `600 28px ${SANS}`;
    ctx.fillText('Scan to open the book', tx + tile / 2, ty + tile + 48);
    if (url) {
      const short = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const s = fitText(short, `400 $px ${MONO}`, tile, 21, 12);
      ctx.font = `400 ${s}px ${MONO}`; ctx.fillStyle = C.mute;
      ctx.fillText(short, tx + tile / 2, ty + tile + 84, tile);
    }
    ctx.textAlign = 'left';

    /* form state */
    dl.disabled = !q;
    hint.classList.remove('warn');
    if (!input.value.trim()) hint.textContent = 'Paste the public URL of your deployment. The QR code updates as you type.';
    else if (!q) { hint.textContent = 'That does not look like a valid web address.'; hint.classList.add('warn'); }
    else if (/^https?:\/\/(localhost|127\.)/.test(url)) { hint.textContent = 'This is a local address, so a visitor\'s phone cannot open it. Use the public deploy URL for the printed card.'; hint.classList.add('warn'); }
    else hint.textContent = 'Output: 1920x1080 PNG, QR error correction level Q.';
  }

  async function open() {
    let saved = '';
    try { saved = localStorage.getItem(SAVE) || ''; } catch (e) { /* storage may be blocked */ }
    const here = /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname) ? location.origin + location.pathname : '';
    input.value = input.value || saved || here;
    dlg.showModal();
    draw();
    await Promise.all([
      `600 72px ${SANS}`, `500 34px ${SANS}`, `400 22px ${SANS}`, `400 25px ${SERIF}`, `500 22px ${MONO}`, `400 21px ${MONO}`
    ].map(f => document.fonts.load(f)));
    draw();
  }

  let t = 0;
  input.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(draw, 80);
    try { localStorage.setItem(SAVE, input.value.trim()); } catch (e) { /* storage may be blocked */ }
  });
  document.getElementById('openPoster').addEventListener('click', open);
  document.getElementById('pClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dl.addEventListener('click', () => {
    cv.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'ai-fundamentals-exhibition-card-1920x1080.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      window.BookApp.toast('Exhibition card saved as PNG.');
    }, 'image/png');
  });
})();
