import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatIDR } from '../utils/formatters'

interface TotalBalanceCardProps {
  totalAmount?: number
  label?: string
  unallocatedAmount?: number
  walletCount?: number
  onOpenWallets?: () => void
}

type SlideKey = 'savings' | 'assets'

const cardSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
  }),
  center: {
    x: '0%',
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
  }),
}

export function TotalBalanceCard({
  totalAmount = 0,
  label = 'Total Savings',
  unallocatedAmount = 0,
  walletCount = 0,
  onOpenWallets,
}: TotalBalanceCardProps) {
  const [activeSlide, setActiveSlide] = useState<SlideKey>('savings')
  const [direction, setDirection] = useState<number>(1)
  const [jellyPulse, setJellyPulse] = useState(0)

  const pointerStartX = useRef<number | null>(null)
  const pointerStartY = useRef<number | null>(null)
  const didSwipeRef = useRef(false)

  const handleSelectSlide = (slide: SlideKey) => {
    if (slide === activeSlide) return
    setDirection(slide === 'assets' ? 1 : -1)
    setActiveSlide(slide)
    setJellyPulse((p) => p + 1)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    pointerStartX.current = e.clientX
    pointerStartY.current = e.clientY
    didSwipeRef.current = false
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation()
    if (pointerStartX.current === null || pointerStartY.current === null) return

    const deltaX = e.clientX - pointerStartX.current
    const deltaY = e.clientY - pointerStartY.current

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      didSwipeRef.current = true
      if (deltaX < 0 && activeSlide === 'savings') {
        handleSelectSlide('assets')
      } else if (deltaX > 0 && activeSlide === 'assets') {
        handleSelectSlide('savings')
      }
    }

    pointerStartX.current = null
    pointerStartY.current = null
  }

  return (
    <div
      className="flex flex-col gap-2.5 select-none w-full"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {/* Top Segmented Button Control with Smooth Jelly Bounce Active Pill (Label Only: Saving | Assets) */}
      <div
        role="tablist"
        aria-label="Balance View Switcher"
        className="relative grid grid-cols-2 p-1 rounded-2xl bg-[#1E1F22] border border-[#141517] shadow-[inset_0_2px_4px_rgba(0,0,0,0.65)]"
      >
        {/* Sliding Active Tactile 3D Jelly Pill */}
        <motion.div
          layout
          transition={{
            layout: {
              type: 'spring',
              stiffness: 420,
              damping: 22,
              mass: 0.85,
            },
          }}
          style={{
            gridColumn: activeSlide === 'savings' ? '1 / 2' : '2 / 3',
            gridRow: '1 / 2',
          }}
          className="w-full h-full z-0 pointer-events-none"
        >
          <motion.div
            key={jellyPulse}
            initial={{ scaleX: 1, scaleY: 1 }}
            animate={{
              scaleX: [1, 1.07, 0.96, 1.02, 1],
              scaleY: [1, 0.91, 1.05, 0.98, 1],
            }}
            transition={{
              duration: 0.48,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full h-full rounded-xl bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2.5px] border-[#363FA0] ring-1 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_12px_rgba(88,101,242,0.4)] transform-gpu"
          />
        </motion.div>

        {/* Tab 1: Saving */}
        <button
          type="button"
          role="tab"
          aria-selected={activeSlide === 'savings'}
          onClick={() => handleSelectSlide('savings')}
          className={`relative z-10 py-2 px-3 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer flex items-center justify-center min-h-[36px] ${
            activeSlide === 'savings'
              ? 'text-white'
              : 'text-[#949BA4] hover:text-[#DBDEE1]'
          }`}
          style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }}
        >
          <motion.span
            key={`savings-label-${activeSlide === 'savings' ? jellyPulse : 'idle'}`}
            animate={
              activeSlide === 'savings'
                ? { scale: [1, 1.08, 0.96, 1.02, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
          >
            Saving
          </motion.span>
        </button>

        {/* Tab 2: Assets */}
        <button
          type="button"
          role="tab"
          aria-selected={activeSlide === 'assets'}
          onClick={() => handleSelectSlide('assets')}
          className={`relative z-10 py-2 px-3 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer flex items-center justify-center min-h-[36px] ${
            activeSlide === 'assets'
              ? 'text-white'
              : 'text-[#949BA4] hover:text-[#DBDEE1]'
          }`}
          style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}
        >
          <motion.span
            key={`assets-label-${activeSlide === 'assets' ? jellyPulse : 'idle'}`}
            animate={
              activeSlide === 'assets'
                ? { scale: [1, 1.08, 0.96, 1.02, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
          >
            Assets
          </motion.span>
        </button>
      </div>

      {/* 100% Width-Aligned Card Carousel Container */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative w-full overflow-hidden rounded-2xl p-[2px] -m-[2px] cursor-grab active:cursor-grabbing touch-pan-y"
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeSlide}
            custom={direction}
            variants={cardSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 360, damping: 32, mass: 0.85 },
            }}
            className="w-full transform-gpu will-change-transform"
          >
            {activeSlide === 'savings' ? (
              <section
                aria-label="Total IDR Savings"
                className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#35383E] via-[#2B2D31] to-[#212327] border-t border-x border-[#40434A]/70 border-b-[4.5px] border-[#16171A] ring-2 ring-[#17181B] p-5 select-none transform-gpu"
                style={{
                  boxShadow:
                    'inset 0 1.5px 2px rgba(255, 255, 255, 0.18), 0 10px 28px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(88, 101, 242, 0.18)',
                }}
              >
                <div
                  className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#5865F2]/20 blur-2xl pointer-events-none transform-gpu"
                  aria-hidden="true"
                />

                <div className="relative z-10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#949BA4] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                      {label}
                    </span>
                    <span className="text-[11px] font-semibold text-[#949BA4]">
                      Allocated in Goals
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="discord-wordmark text-2xl sm:text-3xl font-black tracking-[-0.03em] text-[#E0E1E5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {formatIDR(totalAmount)}
                    </span>
                  </div>
                </div>
              </section>
            ) : (
              <section
                aria-label="Total Unallocated Assets"
                onClick={() => {
                  if (!didSwipeRef.current && onOpenWallets) {
                    onOpenWallets()
                  }
                }}
                role={onOpenWallets ? 'button' : undefined}
                tabIndex={onOpenWallets ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onOpenWallets && (e.key === 'Enter' || e.key === ' ')) {
                    onOpenWallets()
                  }
                }}
                className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#35383E] via-[#2B2D31] to-[#212327] border-t border-x border-[#40434A]/70 border-b-[4.5px] border-[#16171A] ring-2 ring-[#17181B] p-5 select-none transform-gpu transition-transform duration-150 ${
                  onOpenWallets ? 'cursor-pointer active:scale-[0.99]' : ''
                }`}
                style={{
                  boxShadow:
                    'inset 0 1.5px 2px rgba(255, 255, 255, 0.18), 0 10px 28px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(35, 165, 90, 0.18)',
                }}
              >
                <div
                  className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#23A55A]/20 blur-2xl pointer-events-none transform-gpu"
                  aria-hidden="true"
                />

                <div className="relative z-10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#949BA4] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                      Total Assets
                    </span>
                    <span className="text-[11px] font-semibold text-[#949BA4] flex items-center gap-1">
                      <span>
                        {walletCount} {walletCount === 1 ? 'wallet' : 'wallets'}
                      </span>
                      {onOpenWallets && (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-3.5 h-3.5 text-[#949BA4]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="discord-wordmark text-2xl sm:text-3xl font-black tracking-[-0.03em] text-[#E0E1E5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {formatIDR(unallocatedAmount)}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
