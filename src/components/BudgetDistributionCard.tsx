import { formatIDR } from '../utils/formatters'
import type { Goal } from '../types/goal'

interface BudgetDistributionCardProps {
  goals: Goal[]
  onSelectGoal?: (goal: Goal) => void
}

const DISTRIBUTION_COLORS = [
  '#5865F2', // Discord Blurple
  '#23A55A', // Discord Green
  '#F0B232', // Discord Yellow
  '#EB459E', // Discord Fuchsia
  '#00A8FC', // Discord Cyan
  '#57F287', // Discord Mint
  '#F23F43', // Discord Red
]

export function BudgetDistributionCard({ goals, onSelectGoal }: BudgetDistributionCardProps) {
  if (goals.length === 0) {
    return (
      <section
        aria-label="Budget Distribution"
        className="relative overflow-hidden rounded-2xl bg-[#2B2D31] border border-[#1F2023]/80 p-5 shadow-lg select-none transform-gpu"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[#949BA4]">
          Budget Distribution
        </span>
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 text-[#949BA4] mb-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          <span className="text-sm font-semibold text-[#DBDEE1]">
            No Distribution Data
          </span>
          <p className="text-xs text-[#949BA4] max-w-[220px] mt-0.5 leading-relaxed">
            Create goals to view your budget allocation breakdown.
          </p>
        </div>
      </section>
    )
  }

  const totalSavings = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0)
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0)

  // Gunakan total tabungan jika sudah ada pemasukan, fallback ke target budget jika tabungan masih 0
  const useSavings = totalSavings > 0
  const baseTotal = useSavings ? totalSavings : Math.max(1, totalTarget)

  const items = goals.map((goal, index) => {
    const rawAmount = useSavings ? (goal.currentAmount || 0) : goal.targetAmount
    const percentage = baseTotal > 0 ? (rawAmount / baseTotal) * 100 : 0
    return {
      goal,
      amount: rawAmount,
      percentage: Math.round(percentage * 10) / 10,
      color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
    }
  })

  return (
    <section
      aria-label="Budget Distribution"
      className="relative overflow-hidden rounded-2xl bg-[#2B2D31] border border-[#1F2023]/80 p-5 shadow-lg select-none transform-gpu flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#949BA4]">
          Budget Distribution
        </span>
        <span className="text-[11px] text-[#949BA4]">
          {useSavings ? 'Savings Share' : 'Target Share'}
        </span>
      </div>

      {/* Multi-segment Distribution Bar - Tactile 3D Style */}
      <div
        className="w-full h-3.5 rounded-full bg-[#1A1B1E] border border-[#141517] p-[1.5px] overflow-hidden flex"
        style={{
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.7), 0 1px 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {items.map((item) => {
          if (item.percentage <= 0) return null
          return (
            <div
              key={item.goal.id}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
                boxShadow: 'inset 0 1.5px 1px rgba(255, 255, 255, 0.45)',
              }}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full border-b-[2px] border-black/30"
              title={`${item.goal.title}: ${item.percentage}%`}
            />
          )
        })}
      </div>

      {/* Breakdown List directly on card surface */}
      <div className="flex flex-col divide-y divide-[#1F2023]/60 pt-1">
        {items.map((item) => (
          <div
            key={item.goal.id}
            onClick={() => onSelectGoal?.(item.goal)}
            role={onSelectGoal ? 'button' : undefined}
            tabIndex={onSelectGoal ? 0 : undefined}
            className={`py-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
              onSelectGoal ? 'hover:bg-white/[0.02] cursor-pointer' : ''
            }`}
          >
            {/* Left: Color Dot & Goal Title */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span
                style={{ backgroundColor: item.color }}
                className="w-2.5 h-2.5 rounded-full shrink-0"
                aria-hidden="true"
              />
              <span className="font-semibold text-[#DBDEE1] truncate">
                {item.goal.title}
              </span>
            </div>

            {/* Right: Amount & Percentage */}
            <div className="flex items-center gap-3 shrink-0 text-right">
              <span className="font-medium text-[#949BA4]">
                {formatIDR(item.amount)}
              </span>
              <span className="font-bold text-[#E0E1E5] min-w-[42px] text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
