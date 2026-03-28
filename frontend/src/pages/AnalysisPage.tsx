import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconChart, IconTrend, IconSend, IconSpinner } from '../components/Icons';
import { analysisApi, resumeApi } from '../api';
import type { AnalysisResult, ModuleInfo, MultiJDAnalysisResult, CommonRequirements, DimensionalAnalysisV2 } from '../types';
import * as echarts from 'echarts';
import { hideEmbedPageHeader } from '../utils/embedChrome';

function roundToTen(n: number): number {
  return Math.round(Number(n) / 10) * 10;
}

function isDimensionalV2(d: unknown): d is DimensionalAnalysisV2 {
  return !!d && typeof d === 'object' && 'experience_match' in d && 'rewrite_potential' in d;
}

export default function AnalysisPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const chartLeftRef = useRef<HTMLDivElement>(null);
  const chartRightRef = useRef<HTMLDivElement>(null);
  const chartLeftInstance = useRef<echarts.ECharts | null>(null);
  const chartRightInstance = useRef<echarts.ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<{
    average_score?: number;
    results: AnalysisResult[];
    multi_jd_analysis?: MultiJDAnalysisResult;
  } | null>(null);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [resumeId, setResumeId] = useState<string>('');
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [hoverPotential, setHoverPotential] = useState(false);

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  useEffect(() => {
    const dim = analysisData?.results[selectedJobIndex]?.dimensional_analysis;
    if (!isDimensionalV2(dim)) return;
    const em = roundToTen(dim.experience_match?.score ?? 50);
    const rp = roundToTen(dim.rewrite_potential?.score ?? 50);

    const pieOpt = (value: number, color: string) => ({
      series: [{
        type: 'pie', radius: ['62%', '100%'], center: ['50%', '50%'],
        avoidLabelOverlap: false, label: { show: false },
        data: [
          { value, name: 'done', itemStyle: { color } },
          { value: 100 - value, name: 'rest', itemStyle: { color: '#e8e4df' } }
        ]
      }],
      graphic: [{ type: 'text', left: 'center', top: 'center', style: { text: String(value), fontSize: 24, fontWeight: 'bold', fill: '#4a443d' } }]
    });

    if (chartLeftRef.current) {
      chartLeftInstance.current?.dispose();
      chartLeftInstance.current = echarts.init(chartLeftRef.current);
      chartLeftInstance.current.setOption(pieOpt(em, '#926448'));
    }
    if (chartRightRef.current) {
      chartRightInstance.current?.dispose();
      chartRightInstance.current = echarts.init(chartRightRef.current);
      chartRightInstance.current.setOption(pieOpt(rp, '#7a8a5c'));
    }
    return () => {
      chartLeftInstance.current?.dispose();
      chartLeftInstance.current = null;
      chartRightInstance.current?.dispose();
      chartRightInstance.current = null;
    };
  }, [analysisData, selectedJobIndex]);

  const loadData = async () => {
    if (!sessionId) { setLoading(false); return; }
    try {
      const [analysisRes, modulesRes] = await Promise.all([
        analysisApi.get(sessionId),
        resumeApi.getModules(sessionId)
      ]);
      setAnalysisData(analysisRes.data);
      setModules(modulesRes.data.modules || []);
      setResumeId(modulesRes.data.resume_id);
    } catch (error) {
      console.error('加载数据失败:', error);
      alert(error instanceof Error ? error.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary-600';
    if (score >= 60) return 'text-warm-600';
    return 'text-primary-800';
  };

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <IconSpinner className="h-6 w-6 text-primary-600" />
      </div>
    );
  }

  const selectedResult = analysisData?.results[selectedJobIndex];
  const unifiedJd = analysisData?.results?.[0]?.jd_analysis;
  const commonReqs: CommonRequirements | undefined = unifiedJd?.common_requirements as CommonRequirements | undefined
    ?? analysisData?.multi_jd_analysis?.common_requirements as CommonRequirements | undefined;
  const recommendedFocus: string[] = (unifiedJd?.recommended_focus ?? analysisData?.multi_jd_analysis?.recommended_focus ?? []) as string[];
  const dimensionalData = selectedResult?.dimensional_analysis;
  const isV2 = isDimensionalV2(dimensionalData);
  const dimV2 = isV2 ? (dimensionalData as DimensionalAnalysisV2) : null;

  const MODULE_LABELS: Record<string, string> = {
    education: '教育经历',
    internship: '实习经历',
    project: '项目经历',
    skill: '个人技能',
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        {!hideEmbedPageHeader && (
          <header className="mb-7">
            <h1 className="page-title">分析报告</h1>
            <p className="page-desc">基于简历与目标岗位的匹配分析</p>
          </header>
        )}

        {analysisData && (
          <div className="space-y-8">

            {/* ─── 岗位需求摘要 + 能力差距：并排窄长便签，位于首条分隔线前 ─── */}
            {(commonReqs || (selectedResult?.ability_gaps && selectedResult.ability_gaps.length > 0)) && (
              <section className="analysis-notes-grid w-full">
                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:items-stretch sm:gap-8">
                {commonReqs && (
                  <div className="flex min-w-0 flex-col sm:h-full">
                    <h2 className="section-title mb-2 shrink-0">岗位需求摘要</h2>
                    <div className="note-strip note-strip-a note-strip-long flex min-h-0 flex-1 flex-col overflow-y-auto">
                      <div className="space-y-2">
                        {commonReqs.skills && commonReqs.skills.length > 0 && (
                          <div className="border-b border-dashed border-[#c9b18f] pb-2">
                            <h3 className="mb-1 text-sm font-bold tracking-wide text-warm-700">核心技能</h3>
                            <div className="flex flex-wrap gap-1">
                              {commonReqs.skills.slice(0, 6).map((skill: string, i: number) => (
                                <span key={i} className="tag">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {commonReqs.responsibilities && commonReqs.responsibilities.length > 0 && (
                          <div className="border-b border-dashed border-[#c9b18f] pb-2">
                            <h3 className="mb-1 text-sm font-bold tracking-wide text-warm-700">核心职责</h3>
                            <div className="flex flex-wrap gap-1">
                              {commonReqs.responsibilities.slice(0, 4).map((r: string, i: number) => (
                                <span key={i} className="tag">{r}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {commonReqs.keywords && commonReqs.keywords.length > 0 && (
                          <div className="border-b border-dashed border-[#c9b18f] pb-2">
                            <h3 className="mb-1 text-sm font-bold tracking-wide text-warm-700">高频关键词</h3>
                            <div className="flex flex-wrap gap-1">
                              {commonReqs.keywords.slice(0, 6).map((kw: string, i: number) => (
                                <span key={i} className="tag">{kw}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {recommendedFocus.length > 0 && (
                          <div>
                            <h3 className="mb-1 text-sm font-bold tracking-wide text-warm-700">建议重点覆盖</h3>
                            <ul className="space-y-1 text-xs text-warm-700">
                              {recommendedFocus.slice(0, 4).map((f: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-500" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {selectedResult?.ability_gaps && selectedResult.ability_gaps.length > 0 && (
                  <div className="flex min-w-0 flex-col sm:h-full">
                    <h2 className="section-title mb-2 shrink-0">能力差距</h2>
                    <div className="note-strip note-strip-a note-strip-long flex min-h-0 flex-1 flex-col overflow-y-auto">
                      <div className="space-y-2">
                        {selectedResult.ability_gaps.map((gap, i) => (
                          <div
                            key={i}
                            className="min-w-0 border-b border-dashed border-[#c9b18f] pb-2 last:border-b-0"
                          >
                            <h3 className="mb-1 text-sm font-bold tracking-wide text-warm-700">
                              {gap.ability}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              <span className="tag">
                                {gap.priority === 'high' ? '高' : gap.priority === 'medium' ? '中' : '低'}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-warm-600">{gap.gap}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </section>
            )}

            <hr className="divider" />

            {/* ─── Job selector ─── */}
            {analysisData.results.length > 1 && (
              <nav className="flex justify-center gap-2">
                {analysisData.results.map((result, index) => (
                  <button
                    key={result.id || index}
                    onClick={() => setSelectedJobIndex(index)}
                    className={`pill ${index === selectedJobIndex ? 'pill-active' : ''}`}
                  >
                    {result.job_title}
                  </button>
                ))}
              </nav>
            )}

            {/* ─── Dimensional analysis ─── */}
            {selectedResult && (
              <section className="paper-stack">
                <div className="paper-sheet">
                <h2 className="section-title mb-1">{selectedResult.job_title}</h2>

                {isV2 && dimV2 && (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="mx-auto aspect-square w-full max-w-[160px] relative">
                          <div ref={chartLeftRef} className="h-full w-full" />
                          {hoverPotential && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-warm-50/90">
                              <div className="text-center">
                                <div className="text-xs text-warm-500">预计匹配度</div>
                                <div className={`text-xl font-bold ${getScoreColor(roundToTen(dimV2.expected_match_after_rewrite))}`}>
                                  {roundToTen(dimV2.expected_match_after_rewrite)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-warm-500">经历匹配度</p>
                      </div>
                      <div
                        className="text-center"
                        onMouseEnter={() => setHoverPotential(true)}
                        onMouseLeave={() => setHoverPotential(false)}
                      >
                        <div className="mx-auto aspect-square w-full max-w-[160px]">
                          <div ref={chartRightRef} className="h-full w-full" />
                        </div>
                        <p className="mt-1 text-xs text-warm-500">改写潜力</p>
                      </div>
                    </div>
                    {dimV2.implementation_difficulty && (
                      <p className="mt-2 text-center text-xs text-warm-500">
                        改写难度：{dimV2.implementation_difficulty === 'high' ? '高' : dimV2.implementation_difficulty === 'low' ? '低' : '中'}
                      </p>
                    )}
                  </>
                )}
                </div>
              </section>
            )}

            {/* ─── 优势 ─── */}
            {selectedResult?.strengths && selectedResult.strengths.length > 0 && (
              <section className="note-strip note-strip-c">
                <h2 className="section-title mb-3 flex items-center gap-2">
                  <IconTrend className="h-4 w-4 text-warm-500" />
                  优势
                </h2>
                <div className="flex flex-wrap gap-1">
                  {selectedResult.strengths.map((s, i) => (
                    <span key={i} className="tag">{s}</span>
                  ))}
                </div>
              </section>
            )}

            <hr className="divider" />

            {/* ─── 模块概览 ─── */}
            <section className="paper-note">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <IconChart className="h-4 w-4 text-warm-500" />
                模块概览
              </h2>
              <div className="grid grid-cols-4 gap-2 text-center">
                {modules.map((m) => (
                  <div key={m.type}>
                    <div className="text-xl font-semibold text-warm-800">{m.count}</div>
                    <div className="text-xs text-warm-500">{MODULE_LABELS[m.type] || m.type}</div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="divider" />

            {/* ─── CTA ─── */}
            <div className="text-center">
              <button
                onClick={() => navigate(`/rewrite/${sessionId}/${resumeId}`)}
                className="btn-primary inline-flex items-center gap-2"
              >
                开始改写
                <IconSend className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
