// Layout helpers: places text by baseline (matching the original Canva coordinates),
// builds charts, vertical words and watermarks.
(function () {
  function baselineOf(el) {
    const p = document.createElement('span');
    p.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;position:static';
    el.insertBefore(p, el.firstChild);
    const r = p.getBoundingClientRect().top - el.getBoundingClientRect().top;
    p.remove();
    return r;
  }
  function px(n) { return n + 'px'; }

  function charts() {
    document.querySelectorAll('.chart').forEach(c => {
      const s = c.closest('.s');
      const L = +c.style.left.replace('px', ''), T = +c.style.top.replace('px', '');
      const legend = !!c.dataset.legend;
      const pl = L + (legend ? 149 : 123), pr = L + (legend ? 1110 : 1095);
      const pt = T + (legend ? 84 : 44), pb = T + (legend ? 375 : 365);
      const max = +c.dataset.max, step = +c.dataset.step;
      const cats = c.dataset.cats.split('|');
      const series = JSON.parse(c.dataset.series);
      const fmt = n => n.toLocaleString('pt-BR');
      for (let v = 0; v <= max; v += step) {
        const y = pb - (v / max) * (pb - pt);
        const g = document.createElement('div'); g.className = 'cg';
        Object.assign(g.style, { left: px(pl), top: px(y), width: px(pr - pl) });
        if (v === 0) g.style.background = '#9a9a9a';
        s.appendChild(g);
        const t = document.createElement('div'); t.className = 'cy'; t.textContent = fmt(v);
        Object.assign(t.style, { left: px(pl - 160), width: px(146), textAlign: 'right', top: px(y - 11) });
        s.appendChild(t);
      }
      const inner = L + (+c.style.width.replace('px','')) - 40;
      const gw = (inner - pl) / cats.length;
      const bw = series.length > 1 ? 57 : 90, gap = 3;
      cats.forEach((cat, i) => {
        const cx = pl + gw * (i + .5);
        const tw = series.length * bw + (series.length - 1) * gap;
        series.forEach((se, j) => {
          const v = se.v[i];
          let h = (v / max) * (pb - pt);
          if (v > 0 && h < 5) h = 5;
          const x = cx - tw / 2 + j * (bw + gap);
          if (v > 0) {
            const b = document.createElement('div'); b.className = 'cb';
            Object.assign(b.style, { left: px(x), top: px(pb - h), width: px(bw), height: px(h), background: se.c });
            if (h < 20) b.style.borderRadius = '3px 3px 0 0';
            s.appendChild(b);
          }
          if (se.lab) {
            const l = document.createElement('div'); l.className = 'cv'; l.textContent = se.lab[i];
            Object.assign(l.style, { left: px(x - 60), width: px(bw + 120), textAlign: 'center', top: px(pb - h - 30) });
            s.appendChild(l);
          }
        });
        const t = document.createElement('div'); t.className = 'cx'; t.textContent = cat;
        Object.assign(t.style, { left: px(cx - 120), width: px(240), textAlign: 'center', top: px(pb + 10) });
        s.appendChild(t);
      });
      if (legend) {
        const lg = document.createElement('div'); lg.className = 'lg';
        lg.innerHTML = series.map(se => `<i style="background:${se.c}"></i><span style="margin-right:34px">${se.name}</span>`).join('');
        Object.assign(lg.style, { left: '0', width: '1440px', justifyContent: 'center', top: px(T + 32) });
        s.appendChild(lg);
      }
    });
  }

  function watermarks() {
    document.querySelectorAll('.wm').forEach(w => {
      const s = w.closest('.s'); const word = w.dataset.word;
      // positions & sizes from the original layout (rotated -36.87deg)
      [[1060, 832, 129.8], [1150, 1000, 154.4], [-95, 260, 129.8], [-34, 428, 154.4]].forEach(([x, y, fs]) => {
        const d = document.createElement('div'); d.className = 'wmw t';
        d.style.fontSize = fs + 'px'; d.textContent = word; s.appendChild(d);
        const b = baselineOf(d);
        d.style.transform = `translate(${x}px,${y}px) rotate(-36.87deg) translate(0,${-b}px)`;
      });
      w.remove();
    });
  }

  function place() {
    document.querySelectorAll('[data-y]').forEach(el => {
      el.style.top = '0px';
      const b = baselineOf(el);
      el.style.top = px(+el.dataset.y - b);
      if (el.dataset.x !== undefined) el.style.left = px(+el.dataset.x);
      if (el.classList.contains('ctr-in')) {
        el.style.left = px(+el.dataset.l); el.style.width = px(+el.dataset.w); el.style.textAlign = 'center';
      }
    });
    document.querySelectorAll('[data-vx]').forEach(el => {
      el.style.transform = 'none';
      const b = baselineOf(el);
      el.style.transform = `translate(${el.dataset.vx}px,${el.dataset.vy}px) rotate(-90deg) translate(0,${-b}px)`;
    });
    // auto pills behind highlighted words
    document.querySelectorAll('.pb,.pr').forEach(sp => {
      const el = sp.closest('[data-y]'); const s = sp.closest('.s');
      const sr = s.getBoundingClientRect(), r = sp.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(el).fontSize), base = +el.dataset.y;
      const red = sp.classList.contains('pr');
      const d = document.createElement('div'); d.className = red ? 'prx' : 'pbx';
      const l = r.left - sr.left - (red ? 22 : 19), rr = r.right - sr.left + (red ? 30 : 16);
      const t = base - fs * .9, b = base + fs * .25;
      Object.assign(d.style, { left: px(l), top: px(t), width: px(rr - l), height: px(b - t), borderRadius: px(fs * (red ? .25 : .33)) });
      el.parentNode.insertBefore(d, el);
    });
    // red brush under "FALTA DO PEDAÇO"
    const br = document.getElementById('brush');
    if (br) {
      const s = br.closest('.s'); const sr = s.getBoundingClientRect();
      const reds = s.querySelectorAll('[data-y="216"] .red');
      const a = reds[0].getBoundingClientRect(), z = reds[reds.length - 1].getBoundingClientRect();
      Object.assign(br.style, { left: px(a.left - sr.left - 6), top: px(a.bottom - sr.top - 6), width: px(z.right - a.left + 22), height: px(14) });
    }
  }

  // gradient text -> SVG text (keeps the gradient as vector in the PDF)
  function gradText() {
    document.querySelectorAll('.gtext').forEach((sp, i) => {
      const s = sp.closest('.s'), sr = s.getBoundingClientRect(), r = sp.getBoundingClientRect();
      const cs = getComputedStyle(sp), el = sp.closest('[data-y]');
      const base = +el.dataset.y;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('width', r.width + 4); svg.setAttribute('height', 810);
      svg.style.cssText = `position:absolute;left:${r.left - sr.left}px;top:0;overflow:visible`;
      svg.innerHTML = `<defs><linearGradient id="gt${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0153d8"/><stop offset="1" stop-color="#0a7cff"/></linearGradient></defs>` +
        `<text x="0" y="${base}" font-family="${cs.fontFamily.replace(/"/g, "'")}" font-size="${cs.fontSize}" fill="url(#gt${i})">${sp.textContent}</text>`;
      s.appendChild(svg);
      sp.style.background = 'none'; sp.style.color = 'transparent';
    });
  }

  document.fonts.ready.then(() => {
    charts(); watermarks(); place(); gradText();
    document.body.setAttribute('data-ready', '1');
  });
})();
