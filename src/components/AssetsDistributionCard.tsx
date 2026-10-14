import { formatIDR } from '../utils/formatters'
import { renderTactileOrangeStar } from './GoalIcon'
import type { Wallet } from '../types/wallet'

interface AssetsDistributionCardProps {
  wallets: Wallet[]
  onSelectWallet?: (wallet: Wallet) => void
}

const ASSET_COLORS = [
  '#23A55A', // Discord Green
  '#5865F2', // Discord Blurple
  '#F0B232', // Discord Yellow
  '#00A8FC', // Discord Cyan
  '#EB459E', // Discord Fuchsia
  '#57F287', // Discord Mint
  '#F23F43', // Discord Red
]

export function AssetsDistributionCard({
  wallets,
  onSelectWallet,
}: AssetsDistributionCardProps) {
  if (wallets.length === 0) {
    return (
      <section
        aria-label="Assets Distribution"
        className="relative overflow-hidden rounded-2xl bg-[#2B2D31] border border-[#1F2023]/80 p-5 shadow-lg select-none transform-gpu"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[#949BA4]">
          Assets Distribution
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
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
          </svg>
          <span className="text-sm font-semibold text-[#DBDEE1]">
            No Assets Data
          </span>
          <p className="text-xs text-[#949BA4] max-w-[220px] mt-0.5 leading-relaxed">
            Add wallets to view your unallocated assets breakdown.
          </p>
        </div>
      </section>
    )
  }

  const totalAssets = wallets.reduce((sum, w) => sum + (w.balance || 0), 0)
  const hasBalance = totalAssets > 0

  const sortedWallets = [...wallets].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1
    if (!a.isMain && b.isMain) return 1
    return (b.balance || 0) - (a.balance || 0)
  })

  const items = sortedWallets.map((wallet, index) => {
    const rawAmount = wallet.balance || 0
    const percentage = hasBalance
      ? (rawAmount / totalAssets) * 100
      : 100 / sortedWallets.length
    return {
      wallet,
      amount: rawAmount,
      percentage: hasBalance ? Math.round(percentage * 10) / 10 : 0,
      barWidth: Math.round(percentage * 10) / 10,
      color: ASSET_COLORS[index % ASSET_COLORS.length],
    }
  })

  return (
    <section
      aria-label="Assets Distribution"
      className="relative overflow-hidden rounded-2xl bg-[#2B2D31] border border-[#1F2023]/80 p-5 shadow-lg select-none transform-gpu flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#949BA4]">
          Assets Distribution
        </span>
        <span className="text-[11px] text-[#949BA4]">
          Wallet Share
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
          if (item.barWidth <= 0) return null
          return (
            <div
              key={item.wallet.id}
              style={{
                width: `${item.barWidth}%`,
                backgroundColor: item.color,
                boxShadow: 'inset 0 1.5px 1px rgba(255, 255, 255, 0.45)',
              }}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full border-b-[2px] border-black/30"
              title={`${item.wallet.name}: ${item.percentage}%`}
            />
          )
        })}
      </div>

      {/* Breakdown List directly on card surface */}
      <div className="flex flex-col divide-y divide-[#1F2023]/60 pt-1">
        {items.map((item) => (
          <div
            key={item.wallet.id}
            onClick={() => onSelectWallet?.(item.wallet)}
            role={onSelectWallet ? 'button' : undefined}
            tabIndex={onSelectWallet ? 0 : undefined}
            onKeyDown={(e) => {
              if (onSelectWallet && (e.key === 'Enter' || e.key === ' ')) {
                onSelectWallet(item.wallet)
              }
            }}
            className={`py-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
              onSelectWallet ? 'hover:bg-white/[0.02] cursor-pointer' : ''
            }`}
          >
            {/* Left: Color Dot & Wallet Name + Main Star */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span
                style={{ backgroundColor: item.color }}
                className="w-2.5 h-2.5 rounded-full shrink-0"
                aria-hidden="true"
              />
              <span className="font-semibold leading-none text-[#DBDEE1] truncate">
                {item.wallet.name}
              </span>
              {item.wallet.isMain && renderTactileOrangeStar('w-3.5 h-3.5')}
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
