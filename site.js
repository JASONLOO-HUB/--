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
  let rewriteVoiceTimer = 0;
  let rewriteTypeTimer = 0;

  const REWRITE_VOICE_TEXT =
    (typeof window !== 'undefined' && window.SITE_DEMO_MOCK && window.SITE_DEMO_MOCK.rewriteVoiceText) ||
    '在實習期間我負責社群營運與內容策劃，獨立撰寫活動文案，協助落地三場線上活動，整體曝光量提升約三成。';

  let activeIndex = 0;
  /** 录入屏 Mac 内子步骤：0 = 待上传简历，1 = 填写 JD（对齐 frontend InputPage step） */
  let inputDemoStep = 0;
  let inputDemoReachedJd = false;

  function syncInputDemoUI() {
    const slide = document.getElementById('slide-input');
    if (!slide) return;
    const resumePanel = slide.querySelector('[data-demo-input-panel="resume"]');
    const jdPanel = slide.querySelector('[data-demo-input-panel="jd"]');
    const n2 = slide.querySelector('[data-demo-stepper-num="2"]');
    const l2 = slide.querySelector('[data-demo-stepper-label="2"]');
    const onJd = inputDemoStep >= 1;
    if (n2) {
      n2.className =
        'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ' +
        (onJd ? 'border-primary-600 bg-primary-600 text-white' : 'border-warm-300 bg-[#fff7ea] text-warm-500');
    }
    if (l2) {
      l2.className = 'mt-2 text-xs ' + (onJd ? 'text-warm-800' : 'ink-faint');
    }
    if (resumePanel) resumePanel.classList.toggle('hidden', inputDemoStep !== 0);
    if (jdPanel) jdPanel.classList.toggle('hidden', inputDemoStep !== 1);
  }

  function demoScrollEl(slide) {
    return slide?.querySelector('.demo-scroll') ?? null;
  }

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
    if (idx >= 0) showSlide(idx, { navigateMode: 'direct' });
  }

  function resetRewriteStaticDemo() {
    window.clearTimeout(rewriteVoiceTimer);
    window.clearTimeout(rewriteTypeTimer);
    rewriteVoiceTimer = 0;
    rewriteTypeTimer = 0;
    const root = document.getElementById('demo-rewrite-root');
    const tr = document.getElementById('demo-rewrite-transcript');
    if (root) root.classList.remove('is-recording', 'is-transcribing', 'is-done');
    if (tr && "value" in tr) tr.value = "";
    else if (tr) tr.textContent = "";
  }

  function startRewriteStaticVoiceDemo() {
    const root = document.getElementById('demo-rewrite-root');
    const tr = document.getElementById('demo-rewrite-transcript');
    if (!root || !tr) return;
    resetRewriteStaticDemo();
    root.classList.add('is-recording');
    rewriteVoiceTimer = window.setTimeout(() => {
      root.classList.remove('is-recording');
      root.classList.add('is-transcribing');
      let i = 0;
      const step = () => {
        if (i > REWRITE_VOICE_TEXT.length) {
          root.classList.remove('is-transcribing');
          root.classList.add('is-done');
          return;
        }
        if ("value" in tr) tr.value = REWRITE_VOICE_TEXT.slice(0, i);
        else tr.textContent = REWRITE_VOICE_TEXT.slice(0, i);
        i += 1;
        rewriteTypeTimer = window.setTimeout(step, 38);
      };
      step();
    }, 1800);
  }

  function resetDriveScroll(slide) {
    if (!slide || !slide.hasAttribute('data-demo-scroll')) return;
    slide.scrollTop = 0;
    const inner = demoScrollEl(slide);
    if (inner) inner.scrollTop = 0;
  }

  function showSlide(index, opts) {
    const mode = opts && opts.navigateMode ? opts.navigateMode : 'direct';
    const i = Math.max(0, Math.min(slides.length - 1, index));
    const prevIdx = activeIndex;

    if (i === 1) {
      if (mode === 'direct') {
        inputDemoStep = 0;
        inputDemoReachedJd = false;
      } else if (mode === 'deck-next' && prevIdx === 0) {
        inputDemoStep = 0;
        inputDemoReachedJd = false;
      } else if (mode === 'deck-prev' && prevIdx === 2) {
        inputDemoStep = inputDemoReachedJd ? 1 : 0;
      }
    }

    slides.forEach((s, j) => {
      if (j === i) {
        s.classList.add('is-active');
      } else {
        s.classList.remove('is-active');
        if (s.hasAttribute('data-demo-scroll')) {
          s.scrollTop = 0;
          const inner = demoScrollEl(s);
          if (inner) inner.scrollTop = 0;
        }
      }
    });
    activeIndex = i;
    if (prevIdx === 3 && i !== 3) {
      resetRewriteStaticDemo();
      rewriteVoiceConsumed = false;
    }
    if (i === 3) {
      rewriteVoiceConsumed = false;
      resetRewriteStaticDemo();
    }
    updateChrome();
    resetDriveScroll(slides[i]);
    syncDemoScrollFromSection(slides[i]);
    if (i === 1) syncInputDemoUI();
  }

  function onDeckNext() {
    if (activeIndex === 3 && !rewriteVoiceConsumed) {
      startRewriteStaticVoiceDemo();
      rewriteVoiceConsumed = true;
      return;
    }
    if (activeIndex === 4 && followupCtl.active === 0 && typeof followupCtl.apply === 'function') {
      followupCtl.apply(1);
      return;
    }
    if (activeIndex === 1 && inputDemoStep === 0) {
      inputDemoStep = 1;
      inputDemoReachedJd = true;
      syncInputDemoUI();
      return;
    }
    showSlide(activeIndex + 1, { navigateMode: 'deck-next' });
  }

  function onDeckPrev() {
    if (activeIndex === 1 && inputDemoStep === 1) {
      inputDemoStep = 0;
      syncInputDemoUI();
      return;
    }
    showSlide(activeIndex - 1, { navigateMode: 'deck-prev' });
  }

  if (btnPrev) btnPrev.addEventListener('click', onDeckPrev);
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
    heroEnter.addEventListener('click', () => showSlide(1, { navigateMode: 'deck-next' }));
  }

  (function bindInputDemoBack() {
    const slide = document.getElementById('slide-input');
    const back = slide && slide.querySelector('[data-demo-input-back-jd]');
    if (back) {
      back.addEventListener('click', () => {
        if (activeIndex !== 1) return;
        inputDemoStep = 0;
        syncInputDemoUI();
      });
    }
  })();

  const driveSections = Array.from(document.querySelectorAll('[data-demo-scroll]'));

  function getInnerScrollMax(inner) {
    if (!inner) return 0;
    const h = inner.scrollHeight - inner.clientHeight;
    return Math.max(0, h);
  }

  function syncDemoScrollFromSection(section) {
    if (!section || !section.classList.contains('is-active')) return;
    const inner = demoScrollEl(section);
    if (!inner) return;
    const sh = section.scrollHeight;
    const ch = section.clientHeight;
    const maxSection = Math.max(0, sh - ch);
    const p = maxSection <= 0 ? 0 : section.scrollTop / maxSection;
    const maxInner = getInnerScrollMax(inner);
    inner.scrollTop = p * maxInner;
  }

  let driveRaf = 0;
  function onDriveScroll(section) {
    cancelAnimationFrame(driveRaf);
    driveRaf = requestAnimationFrame(() => syncDemoScrollFromSection(section));
  }

  driveSections.forEach((section) => {
    section.addEventListener('scroll', () => onDriveScroll(section), { passive: true });
  });

  window.addEventListener('resize', () => {
    const cur = slides[activeIndex];
    if (cur) syncDemoScrollFromSection(cur);
  });

  showSlide(0);

  /* —— 追问双演示（静态双面板切换） —— */
  const root = document.getElementById('slide-followup');
  const dataEl = document.getElementById('followup-variants-data');
  const panes = root ? root.querySelectorAll('[data-followup-pane]') : [];

  let variants =
    typeof window !== 'undefined' && window.SITE_DEMO_MOCK && window.SITE_DEMO_MOCK.followupVariants
      ? window.SITE_DEMO_MOCK.followupVariants
      : [];
  if ((!variants || !variants.length) && root && dataEl) {
    try {
      variants = JSON.parse(dataEl.textContent);
    } catch {
      variants = [];
    }
  }

  const tabs = root ? root.querySelectorAll('[data-variant-tab]') : [];
  const select = root ? root.querySelector('[data-variant-select]') : null;
  const titleEl = root?.querySelector('[data-variant-title]');
  const blurbEl = root?.querySelector('[data-variant-blurb]');

  if (!root || !dataEl || !titleEl || !blurbEl || variants.length < 2 || panes.length < 2) {
    /* 无追问块时仍保留顶栏/底栏分页 */
  } else {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const outMs = reducedMotion ? 45 : 360;

    let fvActive = 0;
    let busy = false;

    function syncPanes(index) {
      panes.forEach((pane, j) => {
        pane.classList.toggle('is-active', j === index);
      });
    }

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
        syncPanes(index);
        busy = false;
      };

      const swap = () => {
        const I = typeof window !== 'undefined' && window.SITE_I18N;
        const tt = I && I.t(`followup.variant.${index}.title`);
        const bb = I && I.t(`followup.variant.${index}.blurb`);
        titleEl.textContent = tt || v.title;
        blurbEl.textContent = bb || v.blurb;
        finish();
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
    syncPanes(0);

    window.addEventListener('site:langchange', () => {
      const I = window.SITE_I18N;
      if (!I || !titleEl || !blurbEl) return;
      const v = variants[fvActive];
      if (!v) return;
      const tk = I.t(`followup.variant.${fvActive}.title`);
      const bk = I.t(`followup.variant.${fvActive}.blurb`);
      titleEl.textContent = tk || v.title;
      blurbEl.textContent = bk || v.blurb;
    });
  }
})();
