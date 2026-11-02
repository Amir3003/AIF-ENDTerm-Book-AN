/* Back-cover review widget: five neurons, a comment field, localStorage. */
(function () {
  const KEY = 'aif-book-reviews';
  const LABELS = ['', 'Underfit', 'High bias', 'Converging', 'Good fit', 'Global optimum'];
  let seq = 0;

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }

  let toastTimer = 0;
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
  }
  window.BookApp.toast = toast;

  function exportReviews() {
    const blob = new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ai-fundamentals-book-reviews.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  window.mountReview = function (host) {
    const id = 'rev' + (++seq);
    let rating = 0;
    host.innerHTML = `<form class="review" novalidate>
      <h3 id="${id}-h">Leave a Review</h3>
      <div class="neurons" role="radiogroup" aria-labelledby="${id}-h"></div>
      <div class="rate-label" aria-live="polite">Activate 1 to 5 neurons</div>
      <label for="${id}-c">Short comment (teacher or exhibition guest)</label>
      <textarea id="${id}-c" maxlength="280" placeholder="What worked? What should change?"></textarea>
      <div class="review-row"><span class="review-count"></span><button class="btn primary" type="submit">Submit Feedback</button></div>
    </form>`;
    const form = host.firstElementChild, row = form.querySelector('.neurons'),
      label = form.querySelector('.rate-label'), area = form.querySelector('textarea'), countHost = form.querySelector('.review-count');
    const nodes = [], links = [];

    for (let i = 1; i <= 5; i++) {
      if (i > 1) { const s = document.createElement('span'); s.className = 'synapse'; row.appendChild(s); links.push(s); }
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'neuron'; b.textContent = i;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', `${i} of 5: ${LABELS[i]}`);
      b.addEventListener('mouseenter', () => paint(i));
      b.addEventListener('click', () => { rating = i; paint(i); });
      b.addEventListener('keydown', e => {
        const d = (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        rating = Math.max(1, Math.min(5, (rating || i) + d));
        paint(rating); nodes[rating - 1].focus();
      });
      row.appendChild(b); nodes.push(b);
    }
    row.addEventListener('mouseleave', () => paint(rating));

    function paint(n) {
      nodes.forEach((b, i) => {
        b.classList.toggle('on', i < n);
        b.setAttribute('aria-checked', rating === i + 1);
        b.tabIndex = (rating ? rating === i + 1 : i === 0) ? 0 : -1;
      });
      links.forEach((s, i) => s.classList.toggle('on', i + 1 < n));
      label.textContent = n ? `${n} / 5 · ${LABELS[n]}` : 'Activate 1 to 5 neurons';
    }
    function refreshCount() {
      const n = load().length;
      countHost.textContent = '';
      if (!n) return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'review-count link';
      b.textContent = `${n} saved on this device · export`;
      b.addEventListener('click', exportReviews);
      countHost.appendChild(b);
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!rating) { toast('Pick a rating first: activate at least one neuron.'); nodes[0].focus(); return; }
      const list = load();
      list.push({ rating, comment: area.value.trim(), at: new Date().toISOString() });
      if (save(list)) toast('Thank you! Your feedback reduced my loss function.');
      else toast('Thank you! This browser blocks storage, so the review was not saved.');
      rating = 0; area.value = ''; paint(0); refreshCount();
    });

    paint(0); refreshCount();
  };

  document.querySelectorAll('.book [data-review]').forEach(window.mountReview);
})();
