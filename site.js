(function () {
  const SLIDE_IDS = [
    'slide-hero',
    'slide-input',
    'slide-analysis',
    'slide-rewrite',
    'slide-followup',
    'slide-diff',
    'slide-plan',
  ];

  const slides = SLIDE_IDS.map((id) => document.getElementById(id)).filter(Boolean);
  const btnPrev = document.getElementById('deck-nav-prev');
  const btnNext = document.getElementById('deck-nav-next');
  const logoHome = document.getElementById('logo-home');
  const heroEnter = document.getElementById('hero-enter');
  const headerNavNodes = Array.from(document.querySelectorAll('.site-nav [data-slide-target]'));
  const deckDots = Array.from(document.querySelectorAll('.deck-bar__dot'));
  const deckBar = document.getElementById('deck-controls');

  const followupCtl = { apply: null, active: 0 };
  let rewriteVoiceConsumed = false;

  let activeIndex = 0;

  function updateChrome() {
    if (btnPrev) btnPrev.disabled = activeIndex <= 0;
    if (btnNext) {
      const atEnd = activeIndex >= slides.length - 1;
      btnNext.disabled = atEnd;
    }
    headerNavNodes.forEach((btn) => {
      const tid = btn.getAttribute('data-slide-target');
      const idx = SLIDE_IDS.indexOf(tid);
      const on = idx === activeIndex;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-current', on ? 'true' : 'false');
    });
    deckDots.forEach((dot) => {
      const tid = dot.getAttribute('data-slide-target');
      const idx = SLIDE_IDS.indexOf(tid);
      const on = idx === activeIndex;
      dot.classList.toggle('is-active', on);
      dot.setAttribute('aria-current', on ? 'true' : 'false');
    });
    if (deckBar) deckBar.classList.toggle('is-on-hero', activeIndex === 0);
  }

  function goToSlideById(id) {
    const idx = SLIDE_IDS.indexOf(id);
    if (idx >= 0) showSlide(idx);
  }

  function resetDriveScroll(slide) {
    if (!slide || !slide.hasAttribute('data-iframe-scroll')) return;
    slide.scrollTop = 0;
    const iframe = slide.querySelector('iframe.mac-frame');
    if (iframe) {
      try {
        iframe.contentWindow?.scrollTo(0, 0);
      } catch {
        /* ignore */
      }
    }
  }

  function showSlide(index) {
    const i = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((s, j) => {
      if (j === i) {
        s.classList.add('is-active');
      } else {
        s.classList.remove('is-active');
        if (s.hasAttribute('data-iframe-scroll')) {
          s.scrollTop = 0;
          const iframe = s.querySelector('iframe.mac-frame');
          if (iframe) {
            try {
              iframe.contentWindow?.scrollTo(0, 0);
            } catch {
              /* ignore */
            }
          }
        }
      }
    });
    activeIndex = i;
    if (i === 3) {
      rewriteVoiceConsumed = false;
      const iframe = slides[3]?.querySelector('iframe.mac-frame');
      try {
        iframe?.contentWindow?.postMessage({ type: 'fanshen-marketing', action: 'rewrite-reset-voice-demo' }, '*');
      } catch {
        /* ignore */
      }
    }
    updateChrome();
    resetDriveScroll(slides[i]);
    syncIframeFromScroll(slides[i]);
  }

  function onDeckNext() {
    if (activeIndex === 3 && !rewriteVoiceConsumed) {
      const iframe = slides[3]?.querySelector('iframe.mac-frame');
      try {
        iframe?.contentWindow?.postMessage({ type: 'fanshen-marketing', action: 'rewrite-start-voice' }, '*');
      } catch {
        /* ignore */
      }
      rewriteVoiceConsumed = true;
      return;
    }
    if (activeIndex === 4 && followupCtl.active === 0 && typeof followupCtl.apply === 'function') {
      followupCtl.apply(1);
      return;
    }
    showSlide(activeIndex + 1);
  }

  if (btnPrev) btnPrev.addEventListener('click', () => showSlide(activeIndex - 1));
  if (btnNext) btnNext.addEventListener('click', onDeckNext);

  deckDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const tid = dot.getAttribute('data-slide-target');
      if (tid) goToSlideById(tid);
    });
  });

  headerNavNodes.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tid = btn.getAttribute('data-slide-target');
      if (tid) goToSlideById(tid);
    });
  });

  if (logoHome) {
    logoHome.addEventListener('click', (e) => {
      e.preventDefault();
      showSlide(0);
    });
  }

  if (heroEnter) {
    heroEnter.addEventListener('click', () => showSlide(1));
  }

  /* 长屏：仅当前激活的 section 内滚动 → iframe */
  const driveSections = Array.from(document.querySelectorAll('[data-iframe-scroll]'));

  function getIframeScrollMax(iframe) {
    try {
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument || (win && win.document);
      if (!doc || !doc.documentElement) return 0;
      const h = doc.documentElement.scrollHeight - doc.documentElement.clientHeight;
      return Math.max(0, h);
    } catch {
      return 0;
    }
  }

  function setIframeScroll(iframe, y) {
    try {
      iframe.contentWindow?.scrollTo(0, y);
    } catch {
      /* ignore */
    }
  }

  function syncIframeFromScroll(section) {
    if (!section || !section.classList.contains('is-active')) return;
    const iframe = section.querySelector('iframe.mac-frame');
    if (!iframe) return;
    const sh = section.scrollHeight;
    const ch = section.clientHeight;
    const maxScroll = Math.max(0, sh - ch);
    const p = maxScroll <= 0 ? 0 : section.scrollTop / maxScroll;
    const maxIframe = getIframeScrollMax(iframe);
    setIframeScroll(iframe, p * maxIframe);
  }

  let driveRaf = 0;
  function onDriveScroll(section) {
    cancelAnimationFrame(driveRaf);
    driveRaf = requestAnimationFrame(() => syncIframeFromScroll(section));
  }

  driveSections.forEach((section) => {
    section.addEventListener(
      'scroll',
      () => onDriveScroll(section),
      { passive: true }
    );
    const iframe = section.querySelector('iframe.mac-frame');
    if (!iframe) return;
    iframe.addEventListener('load', () => {
      syncIframeFromScroll(section);
      let n = 0;
      const iv = setInterval(() => {
        syncIframeFromScroll(section);
        if (++n > 20) clearInterval(iv);
      }, 200);
    });
  });

  window.addEventListener('resize', () => {
    const cur = slides[activeIndex];
    if (cur) syncIframeFromScroll(cur);
  });

  showSlide(0);

  /* —— 追问双演示 —— */
  const root = document.getElementById('slide-followup');
  const dataEl = document.getElementById('followup-variants-data');

  let variants = [];
  if (root && dataEl) {
    try {
      variants = JSON.parse(dataEl.textContent);
    } catch {
      variants = [];
    }
  }

  const fIframe = root?.querySelector('[data-followup-iframe]');
  const tabs = root ? root.querySelectorAll('[data-variant-tab]') : [];
  const select = root?.querySelector('[data-variant-select]');
  const titleEl = root?.querySelector('[data-variant-title]');
  const blurbEl = root?.querySelector('[data-variant-blurb]');

  if (!root || !dataEl || !fIframe || !titleEl || !blurbEl || variants.length < 2) {
    /* 无追问块时仍保留顶栏/底栏分页 */
  } else {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const outMs = reducedMotion ? 45 : 360;
  const loadCapMs = (() => {
    const raw = root.dataset.iframeLoadCapMs;
    if (raw != null && raw !== '') {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n) && n > 0) return n;
    }
    return reducedMotion ? 120 : 2400;
  })();

  let fvActive = 0;
  let busy = false;

  function syncChromeFv(i) {
    tabs.forEach((tab, j) => {
      const on = j === i;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    if (select) select.value = String(i);
    const activeTab = tabs[i];
    const ae = document.activeElement;
    const toolbarFocus = ae && (Array.from(tabs).includes(ae) || ae === select);
    if (activeTab && toolbarFocus && ae !== select) {
      activeTab.focus({ preventScroll: true });
    }
  }

  function applyFv(index) {
    if (busy || index === fvActive || !variants[index]) return;
    busy = true;
    const v = variants[index];

    const finish = () => {
      root.classList.remove('is-out');
      fvActive = index;
      followupCtl.active = index;
      const panel = document.getElementById('panel-followup');
      if (panel) panel.setAttribute('aria-labelledby', `tab-followup-${index}`);
      syncChromeFv(index);
      busy = false;
    };

    const swap = () => {
      titleEl.textContent = v.title;
      blurbEl.textContent = v.blurb;
      fIframe.src = v.src;
      let done = false;
      const once = () => {
        if (done) return;
        done = true;
        finish();
      };
      fIframe.addEventListener('load', once, { once: true });
      setTimeout(once, loadCapMs);
    };

    root.classList.add('is-out');
    setTimeout(swap, outMs);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => applyFv(parseInt(tab.dataset.index, 10)));
  });

  tabs.forEach((tab) => {
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const i = parseInt(tab.dataset.index, 10);
      const next =
        e.key === 'ArrowRight' ? Math.min(i + 1, tabs.length - 1) : Math.max(i - 1, 0);
      tabs[next].focus();
      applyFv(next);
    });
  });

  if (select) {
    select.addEventListener('change', () => applyFv(parseInt(select.value, 10)));
  }

  followupCtl.apply = applyFv;
  followupCtl.active = 0;
  syncChromeFv(0);
  }
})();
