/** SVG icons as React components. All render at 18x18 by default. */

const defaultClass = "w-[18px] h-[18px] flex-shrink-0";

export function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || defaultClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

export function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || defaultClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || defaultClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}

export function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || defaultClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

export function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-5 h-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-4 h-4"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-4 h-4"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-3.5 h-3.5"} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

export function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-3.5 h-3.5"} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-3.5 h-3.5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-3.5 h-3.5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export function BoardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-3.5 h-3.5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

export function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || defaultClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-4 h-4"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-4 h-4"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
