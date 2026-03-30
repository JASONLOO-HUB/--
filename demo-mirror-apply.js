(function () {
  const M = window.SITE_DEMO_MOCK;
  if (!M) return;

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function tagSpans(labels) {
    return labels.map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  }

  document.querySelectorAll('[data-mock-ref="resume-filename"]').forEach((el) => {
    el.textContent = M.resumeUploadFilename;
  });

  document.querySelectorAll('[data-mock-ref="intern1-original"]').forEach((el) => {
    if ('value' in el && el instanceof HTMLTextAreaElement) {
      el.value = M.intern1Original;
    } else {
      el.textContent = M.intern1Original;
    }
  });

  document.querySelectorAll('[data-mock-ref="followup-sample-answer"]').forEach((el) => {
    if ('value' in el && el instanceof HTMLTextAreaElement) {
      el.value = M.followupSampleAnswer;
    } else {
      el.textContent = M.followupSampleAnswer;
    }
  });

  const aj = document.querySelector('[data-mock-ref="analysis-job-title"]');
  if (aj) aj.textContent = M.analysisJobTitle;

  const sk = document.querySelector('[data-mock-ref="analysis-skills-tags"]');
  if (sk) sk.innerHTML = tagSpans(M.jdSkillTags);
  const du = document.querySelector('[data-mock-ref="analysis-duties-tags"]');
  if (du) du.innerHTML = tagSpans(M.jdDutyTags);
  const kw = document.querySelector('[data-mock-ref="analysis-kw-tags"]');
  if (kw) kw.innerHTML = tagSpans(M.jdKeywordTags);

  const rf = document.querySelector('[data-mock-ref="analysis-recommended-focus"]');
  if (rf && Array.isArray(M.analysisRecommendedFocus)) {
    rf.innerHTML = M.analysisRecommendedFocus
      .map(
        (line) =>
          `<li class="flex items-start gap-2"><span class="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-500"></span>${esc(
            line
          )}</li>`
      )
      .join('');
  }

  const gaps = document.querySelectorAll('[data-mock-gap-index]');
  gaps.forEach((block) => {
    const i = parseInt(block.getAttribute('data-mock-gap-index'), 10);
    const g = M.abilityGaps[i];
    if (!g) return;
    const t = block.querySelector('[data-mock-gap-title]');
    const lv = block.querySelector('[data-mock-gap-level]');
    const b = block.querySelector('[data-mock-gap-body]');
    if (t) t.textContent = g.title;
    if (lv) lv.textContent = g.level;
    if (b) b.textContent = g.body;
  });

  const st = document.querySelector('[data-mock-ref="strength-tags"]');
  if (st) st.innerHTML = tagSpans(M.strengthTags);

  const em = M.pieExperienceMatch ?? M.pieMatchScore ?? 50;
  const rp = M.pieRewritePotential ?? 80;
  const pieMatch = document.querySelector('[data-mock-ref="pie-match"]');
  const pieRw = document.querySelector('[data-mock-ref="pie-rewrite"]');
  if (pieMatch) {
    pieMatch.style.setProperty('--pie-pct', String(em));
    const wrap = pieMatch.parentElement;
    const n = wrap && wrap.querySelector('.fe-pie-center span');
    if (n) n.textContent = String(em);
  }
  if (pieRw) {
    pieRw.style.setProperty('--pie-pct', String(rp));
    const wrap = pieRw.parentElement;
    const n = wrap && wrap.querySelector('.fe-pie-center span');
    if (n) n.textContent = String(rp);
  }
  const expEl = document.querySelector('[data-mock-ref="expected-match-value"]');
  if (expEl && M.expectedMatchAfterRewrite != null) {
    expEl.textContent = String(M.expectedMatchAfterRewrite);
  }

  const mc = M.moduleCounts;
  const me = document.querySelector('[data-mock-ref="mod-count-edu"]');
  const mi = document.querySelector('[data-mock-ref="mod-count-intern"]');
  const mp = document.querySelector('[data-mock-ref="mod-count-proj"]');
  const ms = document.querySelector('[data-mock-ref="mod-count-skill"]');
  if (me) me.textContent = String(mc.education);
  if (mi) mi.textContent = String(mc.internship);
  if (mp) mp.textContent = String(mc.project);
  if (ms) ms.textContent = String(mc.skill);

  document.querySelectorAll('[data-mock-ref="intern-progress"]').forEach((el) => {
    el.textContent = '1 / 4';
  });

  const diffRoot = document.getElementById('demo-static-diff');
  if (diffRoot && M.diff) {
    const d = M.diff;
    diffRoot.innerHTML =
      '<div class="grid gap-px overflow-hidden rounded-lg border border-warm-200 bg-warm-200 md:grid-cols-2">' +
      '<div class="bg-white">' +
      '<div class="border-b border-warm-200 px-4 py-2 text-xs font-medium text-warm-500">原文</div>' +
      '<div class="whitespace-pre-wrap p-4 text-sm leading-relaxed text-warm-700">' +
      '<span>' +
      esc(d.sharedPrefix) +
      '</span>' +
      '<span class="bg-primary-100/60 text-warm-500 line-through">' +
      esc(d.removed) +
      '</span>' +
      '</div></div>' +
      '<div class="bg-white">' +
      '<div class="border-b border-warm-200 px-4 py-2 text-xs font-medium text-warm-500">改寫後</div>' +
      '<div class="whitespace-pre-wrap p-4 text-sm leading-relaxed text-warm-700">' +
      '<span>' +
      esc(d.sharedPrefix) +
      '</span>' +
      '<span class="bg-primary-50 text-primary-800">' +
      esc(d.added) +
      '</span>' +
      '</div></div></div>';
  }

  const notes = document.querySelector('[data-mock-ref="diff-modify-notes"]');
  if (notes && M.diffNotes) {
    notes.innerHTML = M.diffNotes
      .map(
        (line) =>
          `<li class="flex items-start gap-2 text-sm text-warm-700"><span class="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-300"></span>${esc(
            line
          )}</li>`
      )
      .join('');
  }

  function planPriorityItemsToUl(items, dotClass, textClass) {
    const arr = Array.isArray(items)
      ? items
      : items != null && String(items).trim()
        ? [String(items)]
        : [];
    if (!arr.length) return '';
    return (
      arr
        .map(
          (line) =>
            '<li class="flex items-start gap-1.5">' +
            '<span class="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ' +
            dotClass +
            '"></span>' +
            '<span class="' +
            textClass +
            '">' +
            esc(line) +
            '</span></li>'
        )
        .join('') || ''
    );
  }

  function planBulletLi(text) {
    return (
      '<li class="flex items-start gap-1.5">' +
      '<span class="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-300"></span>' +
      esc(text) +
      '</li>'
    );
  }

  function renderPlanMilestoneBlock(m) {
    const ints = m.internship_suggestions || [];
    const projs = m.project_suggestions || [];
    let body = '';
    if (ints.length) {
      body +=
        '<div class="mt-2 space-y-3 text-sm">' +
        '<div><p class="mb-1 text-xs font-medium text-warm-600">實習建議</p>' +
        '<ul class="space-y-0.5 text-warm-700">' +
        ints.map(planBulletLi).join('') +
        '</ul></div></div>';
    }
    if (projs.length) {
      body +=
        '<div class="mt-2 space-y-3 text-sm">' +
        '<div><p class="mb-1 text-xs font-medium text-warm-600">專案建議</p>' +
        '<ul class="space-y-0.5 text-warm-700">' +
        projs.map(planBulletLi).join('') +
        '</ul></div></div>';
    }
    return (
      '<div class="border-l-2 border-warm-200 pl-4">' +
      '<span class="text-xs text-primary-600">' +
      esc(m.date) +
      '</span>' +
      '<p class="text-sm font-medium text-warm-800">' +
      esc(m.milestone) +
      '</p>' +
      body +
      '</div>'
    );
  }

  const P = M.plan;
  if (P) {
    const pp = document.querySelector('[data-mock-ref="plan-progress-pct"]');
    const bar = document.querySelector('[data-mock-ref="plan-progress-bar"]');
    const cl = document.querySelector('[data-mock-ref="plan-confirmed-line"]');
    const ml = document.querySelector('[data-mock-ref="plan-match-line"]');
    if (pp) pp.textContent = `${P.progressPct}%`;
    if (bar) bar.style.width = `${P.progressPct}%`;
    if (cl) cl.textContent = P.confirmedLine;
    if (ml) ml.textContent = P.matchLine;

    const rt = document.querySelector('[data-mock-ref="plan-rhythm-title"]');
    const rb = document.querySelector('[data-mock-ref="plan-rhythm-body"]');
    const rbs = document.querySelector('[data-mock-ref="plan-rhythm-basis"]');
    if (rt) rt.textContent = P.planningMode || P.rhythmTitle || '';
    if (rb) rb.textContent = P.urgencyAssessment || P.rhythmBody || '';
    if (rbs) rbs.textContent = P.judgementBasis || P.rhythmBasis || '';

    const mileRoot = document.getElementById('demo-plan-milestones');
    if (mileRoot && Array.isArray(P.milestones)) {
      mileRoot.innerHTML =
        '<div class="space-y-4">' + P.milestones.map(renderPlanMilestoneBlock).join('') + '</div>';
    }

    const pg = document.getElementById('demo-plan-priority-guide');
    const pr = document.getElementById('demo-plan-priority-rationale');
    if (pg)
      pg.innerHTML = planPriorityItemsToUl(P.priorityGuide, 'bg-warm-400', 'text-warm-700');
    if (pr)
      pr.innerHTML = planPriorityItemsToUl(P.priorityRationale, 'bg-warm-300', 'text-warm-500');

    const recOl = document.getElementById('demo-plan-recommendations');
    if (recOl && Array.isArray(P.recommendations)) {
      recOl.innerHTML = P.recommendations
        .map(
          (rec, i) =>
            '<li class="flex items-start gap-3 text-sm">' +
            '<span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warm-200 text-xs font-medium text-warm-700">' +
            (i + 1) +
            '</span>' +
            '<span class="text-warm-700">' +
            esc(rec) +
            '</span></li>'
        )
        .join('');
    }

    const pitRoot = document.getElementById('demo-plan-pitfalls');
    if (pitRoot && Array.isArray(P.pitfalls)) {
      pitRoot.innerHTML = P.pitfalls
        .map(
          (p) =>
            '<div class="border-l-2 border-warm-200 pl-4 py-1">' +
            '<p class="text-sm font-medium text-warm-800">' +
            esc(p.risk) +
            '</p>' +
            '<p class="mt-0.5 text-sm text-warm-600">原因：' +
            esc(p.why) +
            '</p>' +
            '<p class="text-sm text-warm-600">應對：' +
            esc(p.mitigation) +
            '</p></div>'
        )
        .join('');
    }
  }
})();
