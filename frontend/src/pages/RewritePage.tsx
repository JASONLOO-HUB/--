import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { IconMic, IconSend, IconChevron, IconSpinner, IconSave, IconCheck, IconInfo, RecordDot } from '../components/Icons';
import { resumeApi, voiceApi, rewriteApi, analysisApi } from '../api';
import { FOLLOWUP_PREVIEW_SEED } from '../preview/followupPreviewSeed';
import type { ResumeSection, ModuleInfo, Question, InformationGap } from '../types';
import DiffViewer from '../components/DiffViewer';
import { hideEmbedPageHeader } from '../utils/embedChrome';

const MODULE_LABELS: Record<string, string> = {
  education: '教育经历',
  internship: '实习经历',
  project: '项目经历',
  skill: '个人技能'
};

const MODULE_SUPPORTS_VOICE = ['internship', 'project'];

export default function RewritePage() {
  const { sessionId, resumeId } = useParams<{ sessionId: string; resumeId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [jdText, setJdText] = useState('');
  const [multiJdAnalysis, setMultiJdAnalysis] = useState<Record<string, unknown> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);

  const [followupState, setFollowupState] = useState<{
    shouldFollowup: boolean;
    confidenceScore: number;
    informationGaps: InformationGap[];
    questions: Question[];
    followupCount: number;
    reason: string;
    educationCoursePrompt?: string;
  } | null>(null);

  const [educationCoursePrompt, setEducationCoursePrompt] = useState<string | null>(null);
  const [inputGuidance, setInputGuidance] = useState<{ guidance_text: string; star_hints: string[] } | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Set<string>>>({});
  const [smartMode, setSmartMode] = useState(false);
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [voiceInputUsed, setVoiceInputUsed] = useState(false);

  const [rewrittenContent, setRewrittenContent] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [keyHighlights, setKeyHighlights] = useState<string[]>([]);
  const [exaggerations, setExaggerations] = useState<any[]>([]);
  const [overallExaggerationLevel, setOverallExaggerationLevel] = useState('无');
  const [proofNeeded, setProofNeeded] = useState<string[]>([]);
  const [contentDecisions, setContentDecisions] = useState<any>(null);
  const [atsOptimization, setAtsOptimization] = useState<any>(null);
  const [reasoningProcess, setReasoningProcess] = useState('');

  const searchKey = searchParams.toString();
  const demoParam = searchParams.get('demo');
  const isMarketingRewriteVoice =
    hideEmbedPageHeader &&
    import.meta.env.VITE_USE_MOCK === 'true' &&
    demoParam !== 'followup' &&
    demoParam !== 'diff';
  const marketingScrollDoneRef = useRef(false);
  const marketingVoiceStartedRef = useRef(false);
  const marketingScrollTimerRef = useRef(0);
  const modulesRef = useRef(modules);
  const currentModuleIndexRef = useRef(currentModuleIndex);
  modulesRef.current = modules;
  currentModuleIndexRef.current = currentModuleIndex;

  useEffect(() => { loadData(); }, [sessionId, resumeId, searchKey]);

  const runMarketingVoiceSim = useCallback(async () => {
    const currentModule = modulesRef.current[currentModuleIndexRef.current];
    if (!currentModule || !MODULE_SUPPORTS_VOICE.includes(currentModule.type)) return;
    setIsRecording(true);
    setRecordingTime(0);
    await new Promise((r) => setTimeout(r, 1800));
    setIsRecording(false);
    setIsTranscribing(true);
    const text =
      '在实习期间我负责社群运营与内容策划，独立撰写活动文案，协助落地三场线上活动，整体曝光量提升约三成。';
    setTranscript('');
    for (let i = 0; i < text.length; i += 1) {
      await new Promise((r) => setTimeout(r, 38));
      setTranscript(text.slice(0, i + 1));
    }
    setIsTranscribing(false);
    setVoiceInputUsed(true);
  }, []);

  const scheduleMarketingAutoScroll = useCallback(() => {
    if (!isMarketingRewriteVoice || loading) return;
    window.clearTimeout(marketingScrollTimerRef.current);
    marketingScrollDoneRef.current = false;
    marketingScrollTimerRef.current = window.setTimeout(() => {
      marketingScrollDoneRef.current = true;
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }, 2000);
  }, [isMarketingRewriteVoice, loading]);

  useEffect(() => {
    scheduleMarketingAutoScroll();
    return () => window.clearTimeout(marketingScrollTimerRef.current);
  }, [scheduleMarketingAutoScroll]);

  useEffect(() => {
    if (!isMarketingRewriteVoice) return;
    const onMsg = (e: MessageEvent) => {
      const d = e.data;
      if (!d || d.type !== 'fanshen-marketing') return;
      if (d.action === 'rewrite-reset-voice-demo') {
        marketingVoiceStartedRef.current = false;
        setTranscript('');
        setVoiceInputUsed(false);
        setIsRecording(false);
        setIsTranscribing(false);
        setRecordingTime(0);
        scheduleMarketingAutoScroll();
        return;
      }
      if (d.action !== 'rewrite-start-voice') return;
      if (marketingVoiceStartedRef.current) return;
      marketingVoiceStartedRef.current = true;
      void runMarketingVoiceSim();
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [isMarketingRewriteVoice, runMarketingVoiceSim, scheduleMarketingAutoScroll]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 90) { setIsRecording(false); return 90; }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const activeModuleType = modules[currentModuleIndex]?.type;
    const isEducation = activeModuleType === 'education';
    const section = sections[currentSectionIndex];
    const sectionId = section?.id;
    const alreadyHasPrompt = !!(educationCoursePrompt || followupState?.educationCoursePrompt);
    if (!isEducation || !sectionId || alreadyHasPrompt || rewrittenContent) return;
    let cancelled = false;
    voiceApi.askFollowup(sectionId, {}, jdText, 0, undefined, undefined)
      .then((res) => {
        if (cancelled) return;
        const prompt = res.data?.education_course_prompt;
        if (prompt) setEducationCoursePrompt(prompt);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [modules, currentModuleIndex, currentSectionIndex, sections, educationCoursePrompt, followupState?.educationCoursePrompt, rewrittenContent, jdText]);

  useEffect(() => {
    const activeModuleType = modules[currentModuleIndex]?.type;
    if (activeModuleType === 'education') return;
    const section = sections[currentSectionIndex];
    if (!section?.id || inputGuidance || followupState || rewrittenContent) return;
    let cancelled = false;
    resumeApi.getInputGuidance(section.id)
      .then((res) => { if (!cancelled) setInputGuidance(res.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [modules, currentModuleIndex, currentSectionIndex, sections, inputGuidance, followupState, rewrittenContent]);

  const loadData = async () => {
    if (!sessionId || !resumeId) { setLoading(false); return; }
    try {
      const [modulesRes, analysisRes] = await Promise.all([
        resumeApi.getModules(sessionId),
        analysisApi.get(sessionId)
      ]);
      const modulesWithContent = (modulesRes.data.modules || []).filter((m: ModuleInfo) => m.has_content);
      setModules(modulesWithContent);
      if (analysisRes.data.results && analysisRes.data.results.length > 0) {
        setJdText(analysisRes.data.results[0].jd_text || '');
      }
      const unifiedJd = analysisRes.data.results?.[0]?.jd_analysis;
      if (unifiedJd) {
        setMultiJdAnalysis({
          common_requirements: unifiedJd.common_requirements || {},
          per_job_differentials: unifiedJd.per_job_differentials || {},
          recommended_focus: unifiedJd.recommended_focus || [],
        });
      } else if (analysisRes.data.multi_jd_analysis) {
        setMultiJdAnalysis(analysisRes.data.multi_jd_analysis);
      }
      const isMock = import.meta.env.VITE_USE_MOCK === 'true';
      const wantFollowupPreview =
        isMock &&
        (import.meta.env.VITE_PREVIEW_FOLLOWUP === 'true' || demoParam === 'followup');
      const wantDiffPreview =
        isMock && (import.meta.env.VITE_PREVIEW_DIFF === 'true' || demoParam === 'diff');

      if (modulesWithContent.length > 0) {
        const findInternshipIdx = () => {
          const idx = modulesWithContent.findIndex((m: ModuleInfo) => m.type === 'internship');
          return idx >= 0 ? idx : 0;
        };

        if (wantDiffPreview) {
          const targetIdx = findInternshipIdx();
          setCurrentModuleIndex(targetIdx);
          await loadSections(modulesWithContent[targetIdx].type, { seedDiffPreview: true });
        } else if (wantFollowupPreview) {
          const targetIdx = findInternshipIdx();
          setCurrentModuleIndex(targetIdx);
          await loadSections(modulesWithContent[targetIdx].type, { seedFollowupPreview: true });
        } else if (isMock) {
          const targetIdx = findInternshipIdx();
          setCurrentModuleIndex(targetIdx);
          await loadSections(modulesWithContent[targetIdx].type);
        } else {
          await loadSections(modulesWithContent[0].type);
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      alert(error instanceof Error ? error.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (moduleType: string, options?: { seedFollowupPreview?: boolean; seedDiffPreview?: boolean }) => {
    if (!resumeId) return;
    try {
      const res = await resumeApi.getSections(resumeId, moduleType);
      const raw = res.data.sections || [];
      setSections(raw.map((s: ResumeSection) => ({ ...s, status: s.status || 'pending' })));
      setCurrentSectionIndex(0);
      resetState();

      const isMock = import.meta.env.VITE_USE_MOCK === 'true';

      if (options?.seedDiffPreview && isMock && raw.length > 0) {
        const section = raw[0];
        const rewriteRes = await rewriteApi.rewrite(section.id, section.original_content, {}, '', undefined);
        setRewrittenContent(rewriteRes.data.rewritten_content);
        setKeyHighlights(rewriteRes.data.key_highlights || []);
        setExaggerations(rewriteRes.data.exaggerations || []);
        setOverallExaggerationLevel(rewriteRes.data.overall_exaggeration_level || '无');
        setProofNeeded(rewriteRes.data.proof_needed || []);
        setContentDecisions(rewriteRes.data.content_decisions || null);
        setAtsOptimization(rewriteRes.data.ats_optimization || null);
        setReasoningProcess(rewriteRes.data.reasoning_process || '');
      } else if (options?.seedFollowupPreview && isMock) {
        const seed = FOLLOWUP_PREVIEW_SEED;
        setTranscript(seed.transcript);
        setSummary(seed.summary);
        setFollowupState({
          shouldFollowup: seed.followup.shouldFollowup,
          confidenceScore: seed.followup.confidenceScore,
          informationGaps: seed.followup.informationGaps,
          questions: seed.followup.questions,
          followupCount: seed.followup.followupCount,
          reason: seed.followup.reason,
        });
        setCurrentQuestionIndex(0);
        setAnswers({});
        const variant = new URLSearchParams(window.location.search).get('variant');
        if (variant === 'smart') {
          setSmartMode(true);
        }
      }
    } catch (error) {
      console.error('加载段落失败:', error);
      alert(error instanceof Error ? error.message : '加载段落失败');
    }
  };

  const resetState = () => {
    setTranscript(''); setSummary(null); setFollowupState(null); setEducationCoursePrompt(null);
    setInputGuidance(null);
    setAnswers({}); setSelectedOptions({}); setOtherText({}); setSmartMode(false);
    setRewrittenContent(''); setKeyHighlights([]); setExaggerations([]);
    setOverallExaggerationLevel('无'); setProofNeeded([]); setContentDecisions(null);
    setAtsOptimization(null); setReasoningProcess(''); setRecordingTime(0);
    setIsTranscribing(false);
  };

  const handleRecord = async () => {
    const currentModule = modules[currentModuleIndex];
    if (!MODULE_SUPPORTS_VOICE.includes(currentModule?.type)) { alert('仅实习经历和项目经历支持语音输入'); return; }
    if (voiceInputUsed) { alert('该段落已使用过语音输入，每段经历仅限1次'); return; }
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
    } else {
      setIsRecording(false);
      setIsTranscribing(true);
      try {
        const section = sections[currentSectionIndex];
        const res = await voiceApi.input(section?.id || '', '', currentModule.type);
        setTranscript(res.data.transcript || '');
        setVoiceInputUsed(true);
      } catch (error) {
        console.error('语音转写失败:', error);
        alert(error instanceof Error ? error.message : '语音转写失败');
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleSummarize = async () => {
    if (!transcript || !sections[currentSectionIndex]) return;
    try {
      const res = await voiceApi.summarize(transcript, sections[currentSectionIndex].id, jdText);
      setSummary(res.data.summary);
      setCurrentQuestionIndex(0);
      setAnswers({});
      const coursePrompt = res.data.education_course_prompt;
      if (coursePrompt) setEducationCoursePrompt(coursePrompt);
      setFollowupState({
        shouldFollowup: res.data.should_followup ?? false,
        confidenceScore: res.data.confidence_score ?? 0,
        informationGaps: res.data.information_gaps || [],
        questions: res.data.questions || [],
        followupCount: res.data.followup_count || 0,
        reason: res.data.reason || '',
        educationCoursePrompt: coursePrompt
      });
    } catch (error) {
      console.error('总结失败:', error);
      alert(error instanceof Error ? error.message : '总结失败');
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const toggleOption = (questionId: string, option: string) => {
    setSelectedOptions(prev => {
      const cur = new Set(prev[questionId] || []);
      if (cur.has(option)) cur.delete(option); else cur.add(option);
      const next = { ...prev, [questionId]: cur };
      syncAnswerFromOptions(questionId, cur, otherText[questionId] || '');
      return next;
    });
  };

  const handleOtherText = (questionId: string, text: string) => {
    setOtherText(prev => ({ ...prev, [questionId]: text }));
    const opts = selectedOptions[questionId] || new Set();
    syncAnswerFromOptions(questionId, opts, text);
  };

  const syncAnswerFromOptions = (questionId: string, opts: Set<string>, other: string) => {
    const parts = [...opts];
    if (other.trim()) parts.push(other.trim());
    setAnswers(prev => ({ ...prev, [questionId]: parts.join('，') }));
  };

  const handleAnswerSubmit = async () => {
    if (!sections[currentSectionIndex] || Object.keys(answers).length === 0) return;
    try {
      const res = await voiceApi.answerFollowup(sections[currentSectionIndex].id, answers, jdText);
      setFollowupState({
        shouldFollowup: res.data.should_followup,
        confidenceScore: res.data.confidence_score,
        informationGaps: res.data.information_gaps || [],
        questions: res.data.questions || [],
        followupCount: res.data.followup_count,
        reason: res.data.reason || ''
      });
      if (res.data.collected_info) {
        const nextSummary = res.data.collected_info.summary || res.data.collected_info;
        setSummary(nextSummary);
      }
      setAnswers({}); setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('回答追问失败:', error);
      alert(error instanceof Error ? error.message : '回答追问失败');
    }
  };

  const handleRewrite = async () => {
    if (!sections[currentSectionIndex]) return;
    setRewriteLoading(true);
    try {
      const additionalInfo = { ...summary, ...answers, transcript };
      const res = await rewriteApi.rewrite(
        sections[currentSectionIndex].id,
        sections[currentSectionIndex].original_content,
        additionalInfo, jdText, multiJdAnalysis || undefined
      );
      setRewrittenContent(res.data.rewritten_content);
      setKeyHighlights(res.data.key_highlights || []);
      setExaggerations(res.data.exaggerations || []);
      setOverallExaggerationLevel(res.data.overall_exaggeration_level || '无');
      setProofNeeded(res.data.proof_needed || []);
      setContentDecisions(res.data.content_decisions || null);
      setAtsOptimization(res.data.ats_optimization || null);
      setReasoningProcess(res.data.reasoning_process || '');
    } catch (error) {
      console.error('改写失败:', error);
      alert(error instanceof Error ? error.message : '改写失败');
    } finally {
      setRewriteLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sections[currentSectionIndex] || !rewrittenContent) return;
    try {
      await resumeApi.confirmSection(sections[currentSectionIndex].id);
      setSections(prev => {
        const next = [...prev];
        next[currentSectionIndex] = { ...next[currentSectionIndex], status: 'confirmed' as const };
        return next;
      });
      goToNextSection();
    } catch (error) {
      console.error('保存失败:', error);
      alert(error instanceof Error ? error.message : '保存失败');
    }
  };

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      resetState(); setVoiceInputUsed(false);
    } else {
      const nextModuleIndex = currentModuleIndex + 1;
      if (nextModuleIndex < modules.length) {
        setCurrentModuleIndex(nextModuleIndex);
        loadSections(modules[nextModuleIndex].type);
        setVoiceInputUsed(false);
      } else {
        navigate(`/plan/${sessionId}`);
      }
    }
  };

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1); resetState();
    } else if (currentModuleIndex > 0) {
      const prevModuleIndex = currentModuleIndex - 1;
      setCurrentModuleIndex(prevModuleIndex);
      loadSections(modules[prevModuleIndex].type);
    }
  };

  const skipToRewrite = () => {
    setFollowupState(prev => prev ? { ...prev, shouldFollowup: false } : null);
  };

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <IconSpinner className="h-6 w-6 text-primary-600" />
      </div>
    );
  }

  const currentModule = modules[currentModuleIndex];
  const currentSection = sections[currentSectionIndex];
  const supportsVoice = currentModule && MODULE_SUPPORTS_VOICE.includes(currentModule.type);

  return (
    <div className="page-shell">
      <div className="page-container">
        {!hideEmbedPageHeader && (
          <header className="mb-6">
            <h1 className="page-title">简历改写</h1>
            <p className="page-desc">逐段优化你的简历内容</p>
          </header>
        )}

        {/* Module tabs */}
        <nav className="paper-note mb-8 flex flex-wrap gap-2">
          {modules.map((module, index) => {
            const isCurrent = index === currentModuleIndex;
            const tabDisabled = currentSection?.status !== 'confirmed' && !isCurrent;
            return (
              <button
                key={module.type}
                onClick={() => {
                  if (tabDisabled) return;
                  setCurrentModuleIndex(index);
                  loadSections(module.type);
                }}
                disabled={tabDisabled}
                title={tabDisabled ? '请先完成当前经历的改写并确认保存' : undefined}
                className={`pill ${isCurrent ? 'pill-active' : tabDisabled ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                {MODULE_LABELS[module.type]}
              </button>
            );
          })}
        </nav>

        {currentSection && (() => {
          const completeness = followupState
            ? Math.round(60 + (followupState.confidenceScore / 100) * 40)
            : 0;
          const curQ = followupState?.questions[currentQuestionIndex];
          const curQId = curQ?.id || '';
          const curOpts = curQ?.options || [];
          const hasOptions = smartMode && curOpts.length > 0;
          const defaultTranscriptHint = '用 STAR 简述：情境·任务·行动·结果（尽量量化）；可语音录入';
          const transcriptPlaceholder = (() => {
            const g = inputGuidance?.guidance_text?.trim();
            if (!g) return defaultTranscriptHint;
            return g.length > 140 ? `${g.slice(0, 140)}…` : g;
          })();

          return (
          <div className="space-y-6">
            {/* ── 简历原文（白纸） ── */}
            <div className="resume-paper">
              <div className="flex items-baseline justify-between">
                <h2 className="section-title">
                  {MODULE_LABELS[currentModule?.type]} · 第 {currentSectionIndex + 1} 段
                </h2>
                <span className="text-xs text-warm-400">
                  {currentSectionIndex + 1} / {sections.length}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-warm-400">实习经历原文</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-warm-800">{currentSection.original_content}</p>
              </div>
            </div>

            {/* ── 完整度进度条（仅追问时显示） ── */}
            {followupState && followupState.shouldFollowup && (
              <div className="completeness-bar px-1">
                <div className="completeness-bar-track">
                  <div className="completeness-bar-fill" style={{ width: `${completeness}%` }} />
                </div>
                <span className="shrink-0 text-xs text-warm-500">信息完整度</span>
                <span className="completeness-bar-label">{completeness}%</span>
              </div>
            )}

            {/* ── 追问补充 / 其它操作（暖色纸） ── */}
            <div className="paper-stack">
              <div className="paper-sheet space-y-8">

              {/* Education course prompt */}
              {!rewrittenContent && currentModule?.type === 'education' && (educationCoursePrompt || followupState?.educationCoursePrompt) && (
                <div>
                  <p className="mb-4 text-sm text-warm-700">
                    {(educationCoursePrompt || followupState?.educationCoursePrompt) || ''}
                  </p>
                  <button onClick={handleRewrite} disabled={rewriteLoading} className="btn-primary inline-flex items-center gap-2">
                    {rewriteLoading ? <IconSpinner className="h-4 w-4" /> : <IconSend className="h-4 w-4" />}
                    直接改写
                  </button>
                </div>
              )}

              {/* Voice / text input */}
              {!rewrittenContent && !followupState?.shouldFollowup && !(currentModule?.type === 'education' && (educationCoursePrompt || followupState?.educationCoursePrompt)) && (
                <div>
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-warm-500">
                    {supportsVoice ? '描述这段经历' : currentModule?.type === 'education' ? '补充课程或直接改写' : '补充细节'}
                  </h3>

                  {supportsVoice && !voiceInputUsed && (
                    <div className="mb-4 flex items-center gap-3">
                      {isTranscribing ? (
                        <span className="btn-primary inline-flex cursor-wait items-center gap-2 opacity-80">
                          <IconSpinner className="h-4 w-4" />
                          语音转写中…
                        </span>
                      ) : (
                        <button onClick={handleRecord} disabled={isTranscribing} className={`btn-primary inline-flex items-center gap-2 ${isRecording ? 'bg-primary-700 ring-2 ring-primary-400/50 ring-offset-2 ring-offset-warm-50' : ''}`}>
                          <IconMic className="h-4 w-4" />
                          {isRecording ? `停止录音 ${recordingTime}s` : '开始录音'}
                          {isRecording && <RecordDot active />}
                        </button>
                      )}
                      {!isRecording && !isTranscribing && <span className="text-xs text-warm-400">最长 90s · 点击后开始，再次点击结束</span>}
                      {isRecording && <span className="text-xs text-warm-500 animate-pulse">正在聆听…</span>}
                    </div>
                  )}
                  {supportsVoice && voiceInputUsed && (
                    <p className="mb-3 flex items-center gap-1.5 text-xs text-warm-500">
                      <IconCheck className="h-3.5 w-3.5" /> 已使用语音输入
                    </p>
                  )}
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={transcriptPlaceholder}
                    className="input-field mb-4 min-h-[7.5rem] resize-y"
                  />
                  {transcript && (
                    <button onClick={handleSummarize} className="btn-primary inline-flex items-center gap-2">
                      <IconSend className="h-4 w-4" />
                      提交分析
                    </button>
                  )}
                </div>
              )}

              {/* ── Follow-up questions ── */}
              {followupState && followupState.shouldFollowup && (
                <div>
                  <h3 className="section-title mb-5 flex items-center gap-2">
                    <IconInfo className="h-4 w-4 text-warm-500" />
                    信息补充
                    <span className="text-xs font-normal text-warm-400">
                      {currentQuestionIndex + 1} / {followupState.questions.length}
                    </span>
                  </h3>

                  {/* 第一行：问题卡堆叠与答题区等高，文本框底与最下一张问题卡底对齐 */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
                    {/* ─ 左栏：仅堆叠问题卡片 ─ */}
                    <div className="q-card-stack">
                      {followupState.questions.map((q, index) => {
                        const isActive = index === currentQuestionIndex;
                        const offset = index - currentQuestionIndex;
                        if (offset < 0) return null;
                        const stackScale = isActive ? 1 : Math.max(0.88, 1 - offset * 0.03);
                        const stackOpacity = isActive ? 1 : Math.max(0.3, 1 - offset * 0.3);
                        const stackZ = followupState.questions.length - offset;
                        return (
                          <div
                            key={q.id}
                            className={`q-card ${isActive ? 'q-card-active' : 'q-card-stacked'}`}
                            style={{
                              transform: `scale(${stackScale})`,
                              opacity: stackOpacity,
                              zIndex: stackZ,
                              pointerEvents: isActive || offset <= 3 ? 'auto' : 'none',
                            }}
                            onClick={() => setCurrentQuestionIndex(index)}
                          >
                            {isActive ? (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-warm-800">{q.question}</span>
                                  {q.priority === 'high' && (
                                    <span className="shrink-0 rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">重要</span>
                                  )}
                                </div>
                                {q.reason && (
                                  <p className="mt-1.5 text-xs text-warm-500">{q.reason}</p>
                                )}
                              </>
                            ) : (
                              <span className="invisible">占位</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* ─ 右栏：答题区（与左栏卡片堆叠同高） ─ */}
                    <div className="relative flex h-full min-h-0 flex-col">
                      {/* 智能模式 Toggle（绝对定位，不占纵向空间） */}
                      <div className="absolute -top-7 right-0">
                        <label className="flex cursor-pointer items-center gap-2">
                          <span className="text-xs text-warm-500">智能模式</span>
                          <span
                            className="toggle-track"
                            role="switch"
                            aria-checked={smartMode}
                            data-on={String(smartMode)}
                            onClick={() => setSmartMode(v => !v)}
                          >
                            <span className="toggle-thumb" />
                          </span>
                        </label>
                      </div>

                      {hasOptions ? (
                        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                          <div className="space-y-2">
                            {curOpts.map((opt, oi) => {
                              const sel = selectedOptions[curQId]?.has(opt);
                              return (
                                <div
                                  key={oi}
                                  className={`option-chip ${sel ? 'option-chip-selected' : ''}`}
                                  onClick={() => toggleOption(curQId, opt)}
                                >
                                  <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded border border-current text-[10px]">
                                    {sel ? '✓' : ''}
                                  </span>
                                  {opt}
                                </div>
                              );
                            })}
                            <div className="mt-1 space-y-1.5">
                              <div
                                className={`option-chip ${(otherText[curQId] || '').trim() ? 'option-chip-selected' : ''}`}
                                onClick={() => {
                                  const el = document.getElementById(`other-input-${curQId}`);
                                  el?.focus();
                                }}
                              >
                                <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded border border-current text-[10px]">
                                  {(otherText[curQId] || '').trim() ? '✓' : ''}
                                </span>
                                其他
                              </div>
                              <input
                                id={`other-input-${curQId}`}
                                type="text"
                                value={otherText[curQId] || ''}
                                onChange={(e) => handleOtherText(curQId, e.target.value)}
                                placeholder="补充说明…"
                                className="input-field text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <textarea
                          value={answers[curQId] || ''}
                          onChange={(e) => handleAnswerChange(curQId, e.target.value)}
                          placeholder="在此输入你的回答…"
                          className="min-h-[5rem] w-full flex-1 resize-none rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-800 placeholder:text-warm-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-300/40"
                        />
                      )}
                    </div>
                  </div>

                  {/* 第二行：信息缺口与题目导航 */}
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    <div>
                      {followupState.informationGaps.length > 0 && (
                        <div className="border-t border-warm-200/60 pt-3">
                          <p className="mb-1.5 text-xs font-medium text-warm-500">信息缺口</p>
                          <ul className="space-y-0.5 text-xs text-warm-600">
                            {followupState.informationGaps.map((gap, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-300" />
                                {gap.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className={`flex justify-between text-xs text-warm-400 ${followupState.informationGaps.length === 0 ? 'md:justify-end' : ''}`}>
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="disabled:opacity-30"
                      >
                        ← 上一题
                      </button>
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(followupState.questions.length - 1, prev + 1))}
                        disabled={currentQuestionIndex === followupState.questions.length - 1}
                        className="disabled:opacity-30"
                      >
                        下一题 →
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button onClick={handleAnswerSubmit} disabled={Object.keys(answers).length === 0} className="btn-primary flex-1">
                      提交回答
                    </button>
                    <button onClick={skipToRewrite} className="btn-secondary">跳过</button>
                  </div>
                </div>
              )}

              {/* Ready to rewrite */}
              {followupState && !followupState.shouldFollowup && !rewrittenContent && (
                <div>
                  <p className="mb-3 flex items-center gap-2 text-sm text-warm-700">
                    <IconCheck className="h-4 w-4 text-primary-600" />
                    信息收集完成（完整度 {followupState.confidenceScore}%）
                  </p>
                  <button onClick={handleRewrite} disabled={rewriteLoading} className="btn-primary w-full">
                    {rewriteLoading ? (
                      <span className="flex items-center justify-center gap-2"><IconSpinner className="h-4 w-4" /> 生成中…</span>
                    ) : '生成改写内容'}
                  </button>
                </div>
              )}

              {/* Rewrite result */}
              {rewrittenContent && (
                <div>
                  <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-warm-500">改写对比</h3>
                  <DiffViewer
                    originalText={currentSection?.original_content || ''}
                    modifiedText={rewrittenContent}
                    explanations={keyHighlights}
                    exaggerations={exaggerations}
                    overallExaggerationLevel={overallExaggerationLevel}
                    proofNeeded={proofNeeded}
                    contentDecisions={contentDecisions}
                    atsOptimization={atsOptimization}
                    reasoningProcess={reasoningProcess}
                  />
                  <div className="mt-6 flex gap-3">
                    <button onClick={handleRewrite} className="btn-secondary flex-1">重新生成</button>
                    <button onClick={handleSave} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                      <IconSave className="h-4 w-4" />
                      确认保存
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <hr className="divider" />
              <div className="flex justify-between">
                <button onClick={goToPrevSection} disabled={currentSectionIndex === 0 && currentModuleIndex === 0} className="btn-ghost inline-flex items-center gap-1">
                  <IconChevron className="h-4 w-4" direction="left" />
                  上一段
                </button>
                <button
                  onClick={goToNextSection}
                  disabled={currentSection?.status !== 'confirmed'}
                  title={currentSection?.status !== 'confirmed' ? '请先完成本段并确认保存' : undefined}
                  className="btn-primary inline-flex items-center gap-1"
                >
                  下一段
                  <IconChevron className="h-4 w-4" direction="right" />
                </button>
              </div>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
}
