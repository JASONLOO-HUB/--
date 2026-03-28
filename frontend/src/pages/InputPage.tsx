import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hideEmbedPageHeader } from '../utils/embedChrome';
import { IconUpload, IconDoc, IconX, IconSpinner } from '../components/Icons';
import { sessionApi, resumeApi, jobTargetApi, analysisApi } from '../api';
import type { JobTarget, ParsedData, EducationItem, InternshipItem, ProjectItem } from '../types';

interface ParsedModule {
  type: string;
  count: number;
  has_content: boolean;
  content: string[];
}

interface ResumePreviewData {
  resume_id: string;
  modules: ParsedModule[];
  raw_text: string;
  parsed_data: ParsedData;
}

function normalizeParsedData(raw: unknown): ParsedData {
  const o = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const toEdu = (x: unknown): EducationItem => {
    if (x && typeof x === 'object' && !Array.isArray(x)) {
      const t = x as Record<string, unknown>;
      return { school: String(t.school ?? ''), start_time: String(t.start_time ?? ''), end_time: String(t.end_time ?? ''), degree: String(t.degree ?? ''), grades: String(t.grades ?? '') };
    }
    const s = typeof x === 'string' ? x : '';
    return { school: s, start_time: '', end_time: '', degree: '', grades: '' };
  };
  const toIntern = (x: unknown): InternshipItem => {
    if (x && typeof x === 'object' && !Array.isArray(x)) {
      const t = x as Record<string, unknown>;
      return { company: String(t.company ?? ''), time: String(t.time ?? ''), position: String(t.position ?? ''), work_content: String(t.work_content ?? '') };
    }
    const s = typeof x === 'string' ? x : '';
    return { company: s, time: '', position: '', work_content: '' };
  };
  const toProj = (x: unknown): ProjectItem => {
    if (x && typeof x === 'object' && !Array.isArray(x)) {
      const t = x as Record<string, unknown>;
      return { project_name: String(t.project_name ?? ''), time: String(t.time ?? ''), responsibility: String(t.responsibility ?? ''), project_content: String(t.project_content ?? '') };
    }
    const s = typeof x === 'string' ? x : '';
    return { project_name: s, time: '', responsibility: '', project_content: '' };
  };
  const edu = Array.isArray(o.education) ? o.education.map(toEdu) : [];
  const intern = Array.isArray(o.internship) ? o.internship.map(toIntern) : [];
  const proj = Array.isArray(o.project) ? o.project.map(toProj) : [];
  const skill = Array.isArray(o.skill) ? o.skill.map((x) => (x != null ? String(x) : '')) : [];
  return { education: edu, internship: intern, project: proj, skill, personal_info: (o.personal_info && typeof o.personal_info === 'object') ? (o.personal_info as Record<string, unknown>) : {} };
}

const SECTION_LABELS: Record<string, string> = {
  education: '教育经历',
  internship: '实习经历',
  project: '项目经历',
  skill: '个人技能',
};

export default function InputPage() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobTargets, setJobTargets] = useState<JobTarget[]>([
    { id: '', session_id: '', job_title: '', jd_text: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string>('');
  const [resumePreview, setResumePreview] = useState<ResumePreviewData | null>(null);
  const [editedData, setEditedData] = useState<ParsedData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleUploadAndPreview = async () => {
    if (!resumeFile) { alert('请先上传简历文件'); return; }
    setLoading(true);
    try {
      const sessionRes = await sessionApi.create();
      const newSessionId = sessionRes.data.session_id;
      setSessionId(newSessionId);
      const uploadRes = await resumeApi.upload(resumeFile, newSessionId);
      const modulesRes = await resumeApi.getModules(newSessionId);
      const parsed = normalizeParsedData(uploadRes.data.parsed_data ?? {});
      const previewData: ResumePreviewData = {
        resume_id: uploadRes.data.resume_id,
        modules: modulesRes.data.modules,
        raw_text: uploadRes.data.raw_text || '',
        parsed_data: parsed
      };
      setResumePreview(previewData);
      setEditedData(parsed);
      setShowPreview(true);
    } catch (error) {
      console.error('上传失败:', error);
      alert(error instanceof Error ? error.message : '上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReupload = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      await resumeApi.delete(sessionId);
      setResumeFile(null);
      setResumePreview(null);
      setEditedData(null);
      setShowPreview(false);
      setStep(1);
      const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  function validateTimeBeforeNext(): string | null {
    if (!editedData) return null;
    for (let i = 0; i < (editedData.education?.length ?? 0); i++) {
      const e = editedData.education[i];
      if (!(e.start_time ?? '').trim() || !(e.end_time ?? '').trim()) {
        return '请填写所有教育经历的入学时间与毕业时间';
      }
    }
    for (let i = 0; i < (editedData.internship?.length ?? 0); i++) {
      const item = editedData.internship[i];
      const hasAny = [item.company, item.position, item.work_content].some((v) => (v ?? '').trim());
      if (hasAny && !(item.time ?? '').trim()) return '请填写所有实习经历的时间';
    }
    for (let i = 0; i < (editedData.project?.length ?? 0); i++) {
      const item = editedData.project[i];
      const hasAny = [item.project_name, item.responsibility, item.project_content].some((v) => (v ?? '').trim());
      if (hasAny && !(item.time ?? '').trim()) return '请填写所有项目经历的时间';
    }
    return null;
  }

  const handleConfirmPreview = async () => {
    if (!resumePreview || !editedData) return;
    const err = validateTimeBeforeNext();
    if (err) { alert(err); return; }
    setLoading(true);
    try {
      const hasChanges = JSON.stringify(editedData) !== JSON.stringify(resumePreview.parsed_data);
      if (hasChanges) {
        await resumeApi.update(resumePreview.resume_id, editedData as unknown as Record<string, unknown>);
      }
      setShowPreview(false);
      setStep(2);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    if (!editedData) return;
    const next = [...(editedData.education ?? [])];
    if (!next[index]) next[index] = { school: '', start_time: '', end_time: '', degree: '', grades: '' };
    next[index] = { ...next[index], [field]: value };
    setEditedData({ ...editedData, education: next });
  };
  const updateInternship = (index: number, field: keyof InternshipItem, value: string) => {
    if (!editedData) return;
    const next = [...(editedData.internship ?? [])];
    if (!next[index]) next[index] = { company: '', time: '', position: '', work_content: '' };
    next[index] = { ...next[index], [field]: value };
    setEditedData({ ...editedData, internship: next });
  };
  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    if (!editedData) return;
    const next = [...(editedData.project ?? [])];
    if (!next[index]) next[index] = { project_name: '', time: '', responsibility: '', project_content: '' };
    next[index] = { ...next[index], [field]: value };
    setEditedData({ ...editedData, project: next });
  };
  const updateSkill = (index: number, value: string) => {
    if (!editedData) return;
    const next = [...(editedData.skill ?? [])];
    while (next.length <= index) next.push('');
    next[index] = value;
    setEditedData({ ...editedData, skill: next });
  };
  const addSection = (kind: 'education' | 'internship' | 'project' | 'skill') => {
    if (!editedData) return;
    if (kind === 'education') setEditedData({ ...editedData, education: [...(editedData.education ?? []), { school: '', start_time: '', end_time: '', degree: '', grades: '' }] });
    else if (kind === 'internship') setEditedData({ ...editedData, internship: [...(editedData.internship ?? []), { company: '', time: '', position: '', work_content: '' }] });
    else if (kind === 'project') setEditedData({ ...editedData, project: [...(editedData.project ?? []), { project_name: '', time: '', responsibility: '', project_content: '' }] });
    else setEditedData({ ...editedData, skill: [...(editedData.skill ?? []), ''] });
  };
  const removeSection = (kind: 'education' | 'internship' | 'project' | 'skill', index: number) => {
    if (!editedData) return;
    if (kind === 'education') setEditedData({ ...editedData, education: editedData.education.filter((_, i) => i !== index) });
    else if (kind === 'internship') setEditedData({ ...editedData, internship: editedData.internship.filter((_, i) => i !== index) });
    else if (kind === 'project') setEditedData({ ...editedData, project: editedData.project.filter((_, i) => i !== index) });
    else setEditedData({ ...editedData, skill: editedData.skill.filter((_, i) => i !== index) });
  };

  const updateTarget = (index: number, field: keyof JobTarget, value: string) => {
    const updated = [...jobTargets];
    updated[index] = { ...updated[index], [field]: value };
    setJobTargets(updated);
  };

  const handleSubmit = async () => {
    const validTargets = jobTargets.filter(t => t.job_title && t.jd_text);
    if (validTargets.length === 0) { alert('请填写目标岗位及JD'); return; }
    setLoading(true);
    setProgressMessage('正在提交…');
    try {
      await jobTargetApi.create(sessionId, validTargets);
      setProgressMessage('开始分析…');
      try {
        await analysisApi.triggerStream(sessionId, {
          onProgress: (msg) => setProgressMessage(msg),
        });
      } catch (streamErr) {
        const msg = streamErr instanceof Error ? streamErr.message : String(streamErr);
        if (msg === 'Not Found' || msg.includes('404') || msg.includes('not found')) {
          setProgressMessage('分析中…');
          await analysisApi.trigger(sessionId);
        } else {
          throw streamErr;
        }
      }
      navigate(`/analysis/${sessionId}`);
    } catch (error) {
      console.error('提交失败:', error);
      alert(error instanceof Error ? error.message : '提交失败，请重试');
    } finally {
      setLoading(false);
      setProgressMessage('');
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        {!hideEmbedPageHeader && (
          <header className="mb-7">
            <h1 className="page-title">履程</h1>
            <p className="page-desc">上传简历并填写目标岗位，开始优化</p>
          </header>
        )}

        <div className="mx-auto mb-6 max-w-xl">
          <div className="relative flex items-start justify-between">
            <div className="absolute left-5 right-5 top-4 h-[2px] bg-warm-300" />
            <div className="relative z-10 flex flex-col items-center">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${step >= 1 ? 'border-primary-600 bg-primary-600 text-white' : 'border-warm-300 bg-[#fff7ea] text-warm-500'}`}>1</span>
              <span className={`mt-2 text-xs ${step >= 1 ? 'text-warm-800' : 'ink-faint'}`}>上传简历</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${step >= 2 ? 'border-primary-600 bg-primary-600 text-white' : 'border-warm-300 bg-[#fff7ea] text-warm-500'}`}>2</span>
              <span className={`mt-2 text-xs ${step >= 2 ? 'text-warm-800' : 'ink-faint'}`}>目标岗位</span>
            </div>
          </div>
        </div>

        {step === 1 && !showPreview && (
          <section className="mx-auto max-w-3xl">
            <div className="paper-stack mx-auto max-w-2xl">
              <div className="paper-sheet">
                <h2 className="section-title mb-2">上传简历原稿</h2>
                <p className="mb-4 text-sm ink-soft">支持 PDF / Word。</p>

                <div className="mb-4 rounded-2xl border border-dashed border-[#c9b194] bg-[#fff5e4] px-5 py-10 text-center transition-colors hover:border-primary-400">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <IconDoc className="h-5 w-5 text-primary-700" />
                        <span className="text-sm font-medium text-warm-800">{resumeFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <IconUpload className="mx-auto mb-3 h-6 w-6 text-warm-500" />
                        <p className="text-sm text-warm-700">点击选择文件</p>
                        <p className="mt-1 text-xs ink-faint">拖拽也可上传</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleUploadAndPreview}
                    className="btn-primary"
                    disabled={!resumeFile || loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><IconSpinner className="h-4 w-4" /> 上传中</span>
                    ) : '上传并预览'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── Preview modal ─── */}
        {showPreview && resumePreview && editedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-warm-950/30 p-4">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-warm-200 bg-white">
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-warm-200 px-6 py-4">
                <h2 className="text-base font-medium text-warm-900">简历解析结果</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn-ghost"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="mb-6 text-xs text-warm-500">
                  检查并补全各栏内容，带时间的栏目请务必填写时间
                </p>

                <div className="space-y-8">
                  {/* 教育经历 */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="section-title">{SECTION_LABELS.education}<span className="ml-2 text-xs text-warm-400">{(editedData.education ?? []).length}项</span></h3>
                      <button type="button" onClick={() => addSection('education')} className="btn-ghost text-xs text-primary-600">+ 添加</button>
                    </div>
                    {(editedData.education ?? []).length === 0 ? (
                      <p className="text-sm text-warm-400">暂无</p>
                    ) : (editedData.education ?? []).map((item, idx) => (
                      <div key={`edu-${idx}`} className="mb-3 border-b border-warm-100 pb-3 last:border-0 last:pb-0">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-warm-500">#{idx + 1}</span>
                          {(editedData.education?.length ?? 0) > 1 && (
                            <button type="button" onClick={() => removeSection('education', idx)} className="text-xs text-warm-400 hover:text-primary-700">删除</button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="学校" value={item.school ?? ''} onChange={(e) => updateEducation(idx, 'school', e.target.value)} className="input-field" />
                          <input placeholder="学位" value={item.degree ?? ''} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} className="input-field" />
                          <input placeholder="入学时间（必填）" value={item.start_time ?? ''} onChange={(e) => updateEducation(idx, 'start_time', e.target.value)} className="input-field" />
                          <input placeholder="毕业时间（必填）" value={item.end_time ?? ''} onChange={(e) => updateEducation(idx, 'end_time', e.target.value)} className="input-field" />
                          <input placeholder="成绩" value={item.grades ?? ''} onChange={(e) => updateEducation(idx, 'grades', e.target.value)} className="input-field col-span-2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="divider" />

                  {/* 实习经历 */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="section-title">{SECTION_LABELS.internship}<span className="ml-2 text-xs text-warm-400">{(editedData.internship ?? []).length}项</span></h3>
                      <button type="button" onClick={() => addSection('internship')} className="btn-ghost text-xs text-primary-600">+ 添加</button>
                    </div>
                    {(editedData.internship ?? []).length === 0 ? (
                      <p className="text-sm text-warm-400">暂无</p>
                    ) : (editedData.internship ?? []).map((item, idx) => (
                      <div key={`intern-${idx}`} className="mb-3 border-b border-warm-100 pb-3 last:border-0 last:pb-0">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-warm-500">#{idx + 1}</span>
                          {(editedData.internship?.length ?? 0) > 1 && (
                            <button type="button" onClick={() => removeSection('internship', idx)} className="text-xs text-warm-400 hover:text-primary-700">删除</button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input placeholder="公司" value={item.company ?? ''} onChange={(e) => updateInternship(idx, 'company', e.target.value)} className="input-field" />
                          <input placeholder="时间（必填）" value={item.time ?? ''} onChange={(e) => updateInternship(idx, 'time', e.target.value)} className="input-field" />
                          <input placeholder="职位" value={item.position ?? ''} onChange={(e) => updateInternship(idx, 'position', e.target.value)} className="input-field" />
                          <textarea placeholder="工作内容" value={item.work_content ?? ''} onChange={(e) => updateInternship(idx, 'work_content', e.target.value)} className="input-field min-h-[56px]" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="divider" />

                  {/* 项目经历 */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="section-title">{SECTION_LABELS.project}<span className="ml-2 text-xs text-warm-400">{(editedData.project ?? []).length}项</span></h3>
                      <button type="button" onClick={() => addSection('project')} className="btn-ghost text-xs text-primary-600">+ 添加</button>
                    </div>
                    {(editedData.project ?? []).length === 0 ? (
                      <p className="text-sm text-warm-400">暂无</p>
                    ) : (editedData.project ?? []).map((item, idx) => (
                      <div key={`proj-${idx}`} className="mb-3 border-b border-warm-100 pb-3 last:border-0 last:pb-0">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-warm-500">#{idx + 1}</span>
                          {(editedData.project?.length ?? 0) > 1 && (
                            <button type="button" onClick={() => removeSection('project', idx)} className="text-xs text-warm-400 hover:text-primary-700">删除</button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input placeholder="项目名称" value={item.project_name ?? ''} onChange={(e) => updateProject(idx, 'project_name', e.target.value)} className="input-field" />
                          <input placeholder="时间（必填）" value={item.time ?? ''} onChange={(e) => updateProject(idx, 'time', e.target.value)} className="input-field" />
                          <input placeholder="个人职责" value={item.responsibility ?? ''} onChange={(e) => updateProject(idx, 'responsibility', e.target.value)} className="input-field" />
                          <textarea placeholder="项目内容" value={item.project_content ?? ''} onChange={(e) => updateProject(idx, 'project_content', e.target.value)} className="input-field min-h-[56px]" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="divider" />

                  {/* 个人技能 */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="section-title">{SECTION_LABELS.skill}<span className="ml-2 text-xs text-warm-400">{(editedData.skill ?? []).length}项</span></h3>
                      <button type="button" onClick={() => addSection('skill')} className="btn-ghost text-xs text-primary-600">+ 添加</button>
                    </div>
                    {(editedData.skill ?? []).length === 0 ? (
                      <p className="text-sm text-warm-400">暂无</p>
                    ) : (editedData.skill ?? []).map((s, idx) => (
                      <div key={`skill-${idx}`} className="mb-2 flex gap-2">
                        <input placeholder="技能项" value={s} onChange={(e) => updateSkill(idx, e.target.value)} className="input-field flex-1" />
                        {(editedData.skill?.length ?? 0) > 1 && (
                          <button type="button" onClick={() => removeSection('skill', idx)} className="text-xs text-warm-400 hover:text-primary-700 shrink-0">删除</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-between border-t border-warm-200 px-6 py-4">
                <button onClick={handleReupload} className="btn-secondary" disabled={loading}>重新上传</button>
                <button onClick={handleConfirmPreview} className="btn-primary" disabled={loading}>
                  {loading ? '保存中…' : '确认，下一步'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Job target ─── */}
        {step === 2 && (
          <section className="mx-auto max-w-3xl">
            <div className="paper-stack mx-auto max-w-2xl">
              <div className="paper-sheet">
                <h2 className="section-title mb-2">目标岗位卡片</h2>
                <p className="mb-4 text-sm ink-soft">粘贴岗位 JD，系统会提取关键词。</p>

                {jobTargets.map((target, index) => (
                  <div key={index} className="mb-5">
                    <input
                      type="text"
                      placeholder="岗位名称"
                      value={target.job_title}
                      onChange={(e) => updateTarget(index, 'job_title', e.target.value)}
                      className="input-field mb-3"
                    />
                    <textarea
                      placeholder="粘贴岗位 JD 描述…"
                      value={target.jd_text}
                      onChange={(e) => updateTarget(index, 'jd_text', e.target.value)}
                      className="input-field h-32 resize-none"
                    />
                  </div>
                ))}

                {loading && progressMessage && (
                  <p className="mb-3 text-sm ink-soft">{progressMessage}</p>
                )}

                <div className="flex justify-between">
                  <button onClick={() => setStep(1)} className="btn-secondary">上一步</button>
                  <button
                    onClick={handleSubmit}
                    className="btn-primary"
                    disabled={loading || !jobTargets.some(t => t.job_title && t.jd_text)}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><IconSpinner className="h-4 w-4" /> {progressMessage || '分析中…'}</span>
                    ) : '开始分析'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
