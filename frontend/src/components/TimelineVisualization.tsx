import type { TimelineItem, Milestone } from '../types';

interface TimelineVisualizationProps {
  timeline: TimelineItem[];
  milestones: Milestone[];
}

export default function TimelineVisualization({ timeline, milestones }: TimelineVisualizationProps) {
  if (!timeline || timeline.length === 0) return null;

  const months = timeline.map(item => item.month);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="section-title mb-1">求职时间轴</h3>
        <p className="text-xs text-warm-400">{months[0]} — {months[months.length - 1]}</p>
      </div>

      <div className="space-y-4">
        {timeline.map((item, index) => (
          <div key={index} className="border-l-2 border-warm-200 pl-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-primary-600">{item.month}</span>
              {item.focus && <span className="text-sm font-medium text-warm-800">{item.focus}</span>}
            </div>
            {item.tasks && item.tasks.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {item.tasks.slice(0, 3).map((task, ti) => (
                  <li key={ti} className="flex items-start gap-1.5 text-xs text-warm-600">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-warm-300" />
                    {task}
                  </li>
                ))}
                {item.tasks.length > 3 && (
                  <li className="text-xs text-warm-400">+{item.tasks.length - 3} 项</li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>

      {milestones && milestones.length > 0 && (
        <div>
          <h4 className="section-title mb-3">关键里程碑</h4>
          <div className="space-y-2">
            {milestones.map((m, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warm-200 text-xs font-medium text-warm-700">
                  {index + 1}
                </span>
                <div>
                  <span className="text-xs text-primary-600">{m.date}</span>
                  <p className="text-sm text-warm-700">{m.milestone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
