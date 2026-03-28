import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconCalendar, IconFlag, IconTrend, IconSpinner, IconChevron } from '../components/Icons';
import { planApi } from '../api';
import type { Milestone, Pitfall } from '../types';
import { hideEmbedPageHeader } from '../utils/embedChrome';

export default function PlanPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [timeline, setTimeline] = useState<Array<{ month?: string }>>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [pitfalls, setPitfalls] = useState<Pitfall[]>([]);
  const [priorityGuide, setPriorityGuide] = useState('');
  const [priorityRationale, setPriorityRationale] = useState('');
  const [expandedMilestoneIndex, setExpandedMilestoneIndex] = useState<number | null>(null);
  const [urgencyAssessment, setUrgencyAssessment] = useState('');
  const [planningMode, setPlanningMode] = useState('');
  const [judgementBasis, setJudgementBasis] = useState('');
  const [overallScore, setOverallScore] = useState<number>(0);
  const [progress, setProgress] = useState<{
    total_sections: number;
    rewritten_sections: number;
    confirmed_sections: number;
    completion_rate: number;
  } | null>(null);

  useEffect(() => { if (sessionId) loadPlan(); }, [sessionId]);

  const loadPlan = async () => {
    if (!sessionId) { setLoading(false); return; }
    try {
      const res = await planApi.getSummary(sessionId);
      setTimeline(res.data.timeline || []);
      setRecommendations(res.data.recommendations || []);
      setMilestones(res.data.milestones || []);
      setPitfalls(res.data.pitfalls || []);
      setPriorityGuide(res.data.priority_guide || '');
      setPriorityRationale(res.data.priority_rationale || '');
      setUrgencyAssessment(res.data.urgency_assessment || '');
      setPlanningMode(res.data.planning_mode || '');
      setJudgementBasis(res.data.judgement_basis || '');
      setOverallScore(res.data.overall_score || 0);
      setProgress(res.data.progress || null);
    } catch (error) {
      console.error('加载规划失败:', error);
      alert(error instanceof Error ? error.message : '加载规划失败');
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!sessionId) return;
    setGenerating(true);
    try {
      const res = await planApi.generate(sessionId);
      setMilestones(res.data.milestones || []);
      setRecommendations(res.data.recommendations || []);
      setPitfalls(res.data.pitfalls || []);
      setPriorityGuide(res.data.priority_guide || '');
      setPriorityRationale(res.data.priority_rationale || '');
      setUrgencyAssessment(res.data.urgency_assessment || '');
      setPlanningMode(res.data.planning_mode || '');
      setJudgementBasis(res.data.judgement_basis || '');
      setTimeline(res.data.timeline || []);
      setExpandedMilestoneIndex(null);
      await loadPlan();
    } catch (error) {
      console.error('生成规划失败:', error);
      alert(error instanceof Error ? error.message : '生成规划失败');
    } finally {
      setGenerating(false);
    }
  };

  const hasPlan = milestones.length > 0 || timeline.length > 0 || recommendations.length > 0;
  const topThree = recommendations.slice(0, 3);

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <IconSpinner className="h-6 w-6 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        {!hideEmbedPageHeader && (
          <header className="mb-10">
            <span className="paper-tag mb-4">规划草案</span>
            <h1 className="page-title">未来规划</h1>
            <p className="page-desc">从现在到秋招的求职路线图</p>
          </header>
        )}

        {/* Progress */}
        {progress && (
          <section className="paper-note mb-12">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="text-warm-600">简历优化进度</span>
              <span className="font-medium text-warm-800">{progress.completion_rate}%</span>
            </div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-warm-200">
              <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${progress.completion_rate}%` }} />
            </div>
            <div className="flex justify-between text-xs text-warm-400">
              <span>已确认 {progress.confirmed_sections}/{progress.total_sections} 段</span>
              <span>综合匹配度 {overallScore}%</span>
            </div>
          </section>
        )}

        {!hasPlan ? (
            <section className="paper-stack py-6">
              <div className="paper-sheet py-16 text-center">
            <p className="mb-6 text-sm text-warm-500">尚未生成规划，点击下方按钮开始</p>
            <button onClick={generatePlan} disabled={generating} className="btn-primary inline-flex items-center gap-2">
              {generating && <IconSpinner className="h-4 w-4" />}
              {generating ? '生成中…' : '生成求职规划'}
            </button>
              </div>
          </section>
        ) : (
          <div className="space-y-12">

            {/* 当前节奏 */}
            {(planningMode || urgencyAssessment || judgementBasis) && (
              <section className="paper-note">
                <h2 className="section-title mb-3">当前节奏</h2>
                {planningMode && <p className="text-sm font-medium text-warm-800">{planningMode}</p>}
                {urgencyAssessment && <p className="mt-1 text-sm text-warm-600">{urgencyAssessment}</p>}
                {judgementBasis && <p className="mt-1 text-sm text-warm-500">{judgementBasis}</p>}
              </section>
            )}

            <hr className="divider" />

            {/* 里程碑 */}
            {milestones.length > 0 && (
              <section className="paper-stack">
                <div className="paper-sheet">
                <h2 className="section-title mb-1 flex items-center gap-2">
                  <IconCalendar className="h-4 w-4 text-warm-500" />
                  里程碑
                </h2>
                <p className="mb-5 text-xs text-warm-400">点击可展开实习 / 项目建议</p>

                <div className="space-y-4">
                  {milestones.map((m, index) => {
                    const isExpanded = expandedMilestoneIndex === index;
                    const hasInternship = (m.internship_suggestions?.length ?? 0) > 0;
                    const hasProject = (m.project_suggestions?.length ?? 0) > 0;
                    const canExpand = hasInternship || hasProject;
                    return (
                      <div key={index} className="border-l-2 border-warm-200 pl-4">
                        <button
                          type="button"
                          onClick={() => canExpand && setExpandedMilestoneIndex(isExpanded ? null : index)}
                          className={`block w-full text-left ${canExpand ? 'cursor-pointer' : ''}`}
                        >
                          <span className="text-xs text-primary-600">{m.date}</span>
                          <p className="text-sm font-medium text-warm-800">{m.milestone}</p>
                          {canExpand && (
                            <span className="mt-0.5 inline-flex items-center text-xs text-warm-400">
                              <IconChevron className="h-3 w-3" direction={isExpanded ? 'up' : 'down'} />
                              <span className="ml-0.5">{isExpanded ? '收起' : '展开'}</span>
                            </span>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-3 text-sm">
                            {hasInternship && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-warm-600">实习建议</p>
                                <ul className="space-y-0.5 text-warm-700">
                                  {(m.internship_suggestions ?? []).map((s, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-300" />
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {hasProject && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-warm-600">项目建议</p>
                                <ul className="space-y-0.5 text-warm-700">
                                  {(m.project_suggestions ?? []).map((s, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-300" />
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>
              </section>
            )}

            {/* 投递优先级 */}
            {(priorityGuide || priorityRationale) && (
              <>
                <hr className="divider" />
                <section className="paper-note">
                  <h2 className="section-title mb-3 flex items-center gap-2">
                    <IconFlag className="h-4 w-4 text-warm-500" />
                    投递优先级
                  </h2>
                  {priorityGuide && <p className="text-sm text-warm-700">{priorityGuide}</p>}
                  {priorityRationale && <p className="mt-1 text-sm text-warm-500">{priorityRationale}</p>}
                </section>
              </>
            )}

            {/* 建议 */}
            {topThree.length > 0 && (
              <>
                <hr className="divider" />
                <section className="paper-note">
                  <h2 className="section-title mb-4 flex items-center gap-2">
                    <IconTrend className="h-4 w-4 text-warm-500" />
                    最重要的建议
                  </h2>
                  <ol className="space-y-2">
                    {topThree.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warm-200 text-xs font-medium text-warm-700">{i + 1}</span>
                        <span className="text-warm-700">{rec}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </>
            )}

            {/* 避坑 */}
            {pitfalls.length > 0 && (
              <>
                <hr className="divider" />
                <section className="paper-note">
                  <h2 className="section-title mb-4">避坑指南</h2>
                  <div className="space-y-3">
                    {pitfalls.map((p, idx) => (
                      <div key={idx} className="border-l-2 border-warm-200 pl-4 py-1">
                        <p className="text-sm font-medium text-warm-800">{p.risk}</p>
                        <p className="mt-0.5 text-sm text-warm-600">原因：{p.why}</p>
                        <p className="text-sm text-warm-600">应对：{p.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            <hr className="divider" />

            {/* Actions */}
            <div className="flex justify-center gap-3">
              <button onClick={generatePlan} disabled={generating} className="btn-secondary inline-flex items-center gap-2">
                {generating && <IconSpinner className="h-4 w-4" />}
                重新生成
              </button>
              <button onClick={() => navigate('/')} className="btn-primary">完成</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
