import { diffLines } from 'diff';

interface ExaggerationDetail {
  original: string;
  rewritten: string;
  exaggeration_type: string;
  exaggeration_level: string;
  factual_basis: string;
  interview_preparation: string;
}

interface ContentDecisions {
  kept: string[];
  condensed: string[];
  removed: string[];
}

interface ATSOptimization {
  keywords_included: string[];
  keywords_missing: string[];
  format_compliance: string;
}

interface DiffViewerProps {
  originalText: string;
  modifiedText: string;
  explanations?: string[];
  exaggerations?: ExaggerationDetail[];
  overallExaggerationLevel?: string;
  proofNeeded?: string[];
  contentDecisions?: ContentDecisions;
  atsOptimization?: ATSOptimization;
  reasoningProcess?: string;
}

export default function DiffViewer({
  originalText,
  modifiedText,
  explanations = [],
  exaggerations = [],
  overallExaggerationLevel = '无',
  proofNeeded = [],
  contentDecisions,
  atsOptimization,
  reasoningProcess
}: DiffViewerProps) {
  const diff = diffLines(originalText, modifiedText);

  return (
    <div className="space-y-6">
      {overallExaggerationLevel !== '无' && (
        <p className="text-xs text-warm-500">
          包装程度：<span className="font-medium text-warm-700">{overallExaggerationLevel}</span>
        </p>
      )}

      {/* Side-by-side diff */}
      <div className="grid gap-px overflow-hidden rounded-lg border border-warm-200 bg-warm-200 md:grid-cols-2">
        <div className="bg-white">
          <div className="border-b border-warm-200 px-4 py-2 text-xs font-medium text-warm-500">原文</div>
          <div className="whitespace-pre-wrap p-4 text-sm leading-relaxed text-warm-700">
            {diff.map((part, i) =>
              !part.added && (
                <span key={i} className={part.removed ? 'bg-primary-100/60 text-warm-500 line-through' : ''}>
                  {part.value}
                </span>
              )
            )}
          </div>
        </div>
        <div className="bg-white">
          <div className="border-b border-warm-200 px-4 py-2 text-xs font-medium text-warm-500">改写后</div>
          <div className="whitespace-pre-wrap p-4 text-sm leading-relaxed text-warm-700">
            {diff.map((part, i) =>
              !part.removed && (
                <span key={i} className={part.added ? 'bg-primary-50 text-primary-800' : ''}>
                  {part.value}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Explanations */}
      {explanations.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-warm-500">修改说明</h4>
          <ul className="space-y-1">
            {explanations.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-300" />
                {e}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Exaggerations */}
      {exaggerations.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-warm-500">包装详情</h4>
          <div className="space-y-3">
            {exaggerations.map((item, i) => (
              <div key={i} className="border-l-2 border-warm-200 pl-4 text-sm">
                <div className="flex items-center gap-2 text-xs text-warm-500">
                  <span className="tag">{item.exaggeration_level}</span>
                  <span>{item.exaggeration_type}</span>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <span className="text-warm-500 line-through">{item.original}</span>
                  <span className="font-medium text-warm-800">{item.rewritten}</span>
                </div>
                <p className="mt-1 text-xs text-warm-500">事实依据：{item.factual_basis}</p>
                <p className="text-xs text-warm-500">面试准备：{item.interview_preparation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content decisions */}
      {contentDecisions && (
        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-warm-500">内容决策</h4>
          <div className="space-y-2 text-sm text-warm-700">
            {contentDecisions.kept.length > 0 && (
              <div>
                <span className="text-xs font-medium text-warm-600">保留</span>
                <ul className="mt-0.5 space-y-0.5">{contentDecisions.kept.map((s, i) => <li key={i} className="flex items-start gap-1.5"><span className="mt-1 text-warm-400">+</span>{s}</li>)}</ul>
              </div>
            )}
            {contentDecisions.condensed.length > 0 && (
              <div>
                <span className="text-xs font-medium text-warm-600">精简</span>
                <ul className="mt-0.5 space-y-0.5">{contentDecisions.condensed.map((s, i) => <li key={i} className="flex items-start gap-1.5"><span className="mt-1 text-warm-400">~</span>{s}</li>)}</ul>
              </div>
            )}
            {contentDecisions.removed.length > 0 && (
              <div>
                <span className="text-xs font-medium text-warm-600">删除</span>
                <ul className="mt-0.5 space-y-0.5">{contentDecisions.removed.map((s, i) => <li key={i} className="flex items-start gap-1.5"><span className="mt-1 text-warm-400">-</span>{s}</li>)}</ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ATS */}
      {atsOptimization && atsOptimization.keywords_included.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-warm-500">ATS 优化</h4>
          <div className="flex flex-wrap gap-1.5">
            {atsOptimization.keywords_included.map((kw, i) => (
              <span key={i} className="tag">{kw}</span>
            ))}
          </div>
          {atsOptimization.keywords_missing.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-xs text-warm-500">建议补充</p>
              <div className="flex flex-wrap gap-1.5">
                {atsOptimization.keywords_missing.map((kw, i) => (
                  <span key={i} className="tag opacity-60">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Proof needed */}
      {proofNeeded.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-warm-500">建议补充证明</h4>
          <ul className="space-y-0.5">
            {proofNeeded.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-300" />
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reasoning (collapsible) */}
      {reasoningProcess && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-warm-400 hover:text-warm-600">
            查看改写逻辑
          </summary>
          <div className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-warm-500">
            {reasoningProcess}
          </div>
        </details>
      )}
    </div>
  );
}
