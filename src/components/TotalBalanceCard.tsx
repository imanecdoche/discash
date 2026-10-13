import { formatIDR } from '../utils/formatters'

interface TotalBalanceCardProps {
  totalAmount?: number
  label?: string
}

export function TotalBalanceCard({
  totalAmount = 0,
  label = 'Total Savings',
}: TotalBalanceCardProps) {
  return (
    <section
      aria-label="Total IDR Savings"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#35383E] via-[#2B2D31] to-[#212327] border-t border-x border-[#40434A]/70 border-b-[4.5px] border-[#16171A] ring-2 ring-[#17181B] p-5 select-none transform-gpu transition-all duration-200"
      style={{
        boxShadow:
          'inset 0 1.5px 2px rgba(255, 255, 255, 0.18), 0 10px 28px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(88, 101, 242, 0.18)',
      }}
    >
      {/* Discord Blurple Ambient Glow Effect */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#5865F2]/20 blur-2xl pointer-events-none transform-gpu"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-[#949BA4] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="discord-wordmark text-2xl sm:text-3xl font-black tracking-[-0.03em] text-[#E0E1E5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {formatIDR(totalAmount)}
          </span>
        </div>
      </div>
    </section>
  )
}
