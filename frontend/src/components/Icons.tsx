const s = { width: '1em', height: '1em', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' };

export function IconUpload({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <path d="M12 16V4m0 0L8 8m4-4l4 4" />
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  );
}

export function IconDoc({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}

export function IconMic({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0014 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}

export function IconSend({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconCheck({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <polyline points="4 12 9 17 20 6" />
    </svg>
  );
}

export function IconX({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

export function IconChevron({ className = '', direction = 'right' }: { className?: string; direction?: 'left' | 'right' | 'up' | 'down' }) {
  const paths: Record<string, string> = {
    right: 'M9 6l6 6-6 6',
    left: 'M15 6l-6 6 6 6',
    up: 'M6 15l6-6 6 6',
    down: 'M6 9l6 6 6-6',
  };
  return (
    <svg {...s} className={className}>
      <polyline points={paths[direction]} />
    </svg>
  );
}

export function IconSave({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
      <path d="M17 21v-7H7v7" />
      <path d="M7 3v4h7" />
    </svg>
  );
}

export function IconTarget({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTrend({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <polyline points="4 16 8 12 12 14 20 6" />
      <polyline points="16 6 20 6 20 10" />
    </svg>
  );
}

export function IconCalendar({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

export function IconSpinner({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={`animate-spin ${className}`}>
      <path d="M12 2a10 10 0 0110 10" strokeWidth="2" />
    </svg>
  );
}

export function IconChart({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="2" width="4" height="19" rx="1" />
    </svg>
  );
}

export function IconFlag({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <path d="M4 21V4" />
      <path d="M4 4l12 4-12 4" />
    </svg>
  );
}

export function IconInfo({ className = '' }: { className?: string }) {
  return (
    <svg {...s} className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RecordDot({ active = false }: { active?: boolean }) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${active ? 'bg-primary-600 animate-pulse' : 'bg-warm-300'}`} />
  );
}
