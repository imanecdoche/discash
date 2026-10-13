import { formatIDR } from '../utils/formatters'
import type { Goal } from '../types/goal'

interface TotalGoalsCardProps {
  goals: Goal[]
}

export function TotalGoalsCard({ goals }: TotalGoalsCardProps) {
  const totalGoals = goals.length
  const completedGoals = goals.filter((g) => (g.currentAmount || 0) >= g.targetAmount).length
  const inProgressGoals = totalGoals - completedGoals
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0)

  return (
    <section
      aria-label="Total Goals Statistics"
      className="relative overflow-hidden rounded-2xl bg-[#2B2D31] border border-[#1F2023]/80 p-5 shadow-lg select-none transform-gpu"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#949BA4]">
            Total Goals
          </span>
          <div className="flex items-baseline gap-2">
            <span className="discord-wordmark text-2xl sm:text-3xl font-black tracking-[-0.03em] text-[#E0E1E5]">
              {totalGoals}
            </span>
            <span className="text-xs text-[#949BA4]">
              {totalGoals === 1 ? 'goal' : 'goals'}
            </span>
          </div>
        </div>

        <div className="text-right flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#949BA4]">
            Target Budget
          </span>
          <span className="text-sm sm:text-base font-bold text-[#DBDEE1]">
            {formatIDR(totalTarget)}
          </span>
        </div>
      </div>

      {totalGoals > 0 && (
        <div className="mt-4 pt-3 border-t border-[#1F2023]/60 flex items-center justify-between text-xs text-[#949BA4]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5865F2]" />
            <span>{inProgressGoals} In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#23A55A]" />
            <span>{completedGoals} Completed</span>
          </div>
        </div>
      )}
    </section>
  )
}
