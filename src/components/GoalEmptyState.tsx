interface GoalEmptyStateProps {
  className?: string
}

export function GoalEmptyState({ className = '' }: GoalEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-16 text-center select-none ${className}`}
      aria-label="No goals yet"
    >
      {/* Free-standing Icon without any surrounding box or background container */}
      <div className="mb-4 text-[#949BA4]">
        <svg
          viewBox="0 0 24 24"
          className="w-16 h-16 text-[#949BA4]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Typography */}
      <h2 className="discord-wordmark text-lg font-bold tracking-tight text-[#E0E1E5] mb-1.5">
        No Goals Yet
      </h2>
      <p className="text-sm text-[#949BA4] max-w-[250px] leading-relaxed">
        You haven't created any savings goals yet. Tap the + button below to get started.
      </p>
    </div>
  )
}
