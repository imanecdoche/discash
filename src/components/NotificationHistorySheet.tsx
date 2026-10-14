import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import type { Goal, GoalTransaction } from '../types/goal'
import { formatIDR } from '../utils/formatters'
import { renderGoalIcon } from './GoalIcon'

interface NotificationHistorySheetProps {
  isOpen: boolean
  goals: Goal[]
  onClose: () => void
  onSelectTransaction: (transaction: GoalTransaction, goal: Goal) => void
}

export function NotificationHistorySheet({
  isOpen,
  goals,
  onClose,
  onSelectTransaction,
}: NotificationHistorySheetProps) {
  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)

  // Agregasi seluruh mutasi/transaksi dari seluruh goal, urutkan descending (terbaru di atas)
  const allTransactions = useMemo(() => {
    const list: { transaction: GoalTransaction; goal: Goal }[] = []
    for (const goal of goals) {
      if (goal.transactions && goal.transactions.length > 0) {
        for (const trx of goal.transactions) {
          list.push({ transaction: trx, goal })
        }
      }
    }
    return list.sort(
      (a, b) =>
        new Date(b.transaction.createdAt).getTime() -
        new Date(a.transaction.createdAt).getTime()
    )
  }, [goals])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop gelap tanpa blur */}
          <motion.div
            key="notification-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 cursor-pointer z-50 pointer-events-auto"
            aria-hidden="true"
          />

          {/* Panel Sheet Notifikasi Riwayat Transaksi */}
          <motion.div
            key="notification-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              duration: 0.35,
              ease: [0.32, 0.72, 0, 1],
            }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.75 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_e, info) => {
              setIsDragging(false)
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose()
              }
            }}
            className="fixed inset-x-0 bottom-0 mx-auto z-50 w-full max-w-[430px] h-[92dvh] max-h-[820px] bg-[#2B2D31] rounded-t-3xl border-t border-[#1F2023]/90 shadow-2xl flex flex-col overflow-hidden pointer-events-auto origin-top transform-gpu will-change-transform"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-sheet-title"
          >
            {/* Top Drag Handle */}
            <div
              onPointerDown={(e) => {
                setIsDragging(true)
                dragControls.start(e)
              }}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
              className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none shrink-0 select-none"
            >
              <div
                className={`h-2 rounded-full border-b-[2px] ring-1 ring-[#17181B] transition-all duration-250 ease-out select-none ${
                  isDragging
                    ? 'w-20 bg-gradient-to-b from-[#727782] to-[#454852] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),0_2px_8px_rgba(0,0,0,0.6)]'
                    : 'w-12 bg-gradient-to-b from-[#5E626B] to-[#383A40] hover:from-[#6B707A] hover:to-[#44464D] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_2px_5px_rgba(0,0,0,0.5)] active:w-20 active:bg-gradient-to-b active:from-[#727782] active:to-[#454852]'
                }`}
                title="Drag down to close"
              />
            </div>

            {/* Header Panel */}
            <div
              onPointerDown={(e) => {
                if (
                  (e.target as HTMLElement).tagName !== 'BUTTON' &&
                  !(e.target as HTMLElement).closest('button')
                ) {
                  setIsDragging(true)
                  dragControls.start(e)
                }
              }}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
              className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-[#1F2023]/60 shrink-0 select-none cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="flex items-center gap-2">
                <h2
                  id="notification-sheet-title"
                  className="discord-wordmark text-lg font-bold text-[#E0E1E5] tracking-tight"
                >
                  All Transactions
                </h2>
                {allTransactions.length > 0 && (
                  <span className="text-xs font-semibold text-[#949BA4]">
                    ({allTransactions.length})
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#1E1F22] hover:bg-[#35373C] text-[#949BA4] hover:text-[#DBDEE1] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close transactions"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-3 select-none overscroll-contain">
              {allTransactions.length === 0 ? (
                /* Empty state: Tanpa box & tanpa warna ungu sesuai aturan anti-patterns */
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="mb-3 text-[#949BA4]">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-12 h-12 text-[#949BA4]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <span className="text-base font-semibold text-[#DBDEE1]">
                    No Transactions Yet
                  </span>
                  <p className="text-xs text-[#949BA4] max-w-[260px] mt-1 leading-relaxed">
                    All deposits and withdrawals recorded across any of your goals will appear here.
                  </p>
                </div>
              ) : (
                /* List Transaksi: Bersih di atas surface dengan pembatas halus */
                <div className="flex flex-col divide-y divide-[#1F2023]/60">
                  {allTransactions.map(({ transaction: trx, goal }) => {
                    const isDeposit = trx.type === 'deposit'
                    const formattedDate = new Date(trx.createdAt).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )

                    return (
                      <div
                        key={trx.id}
                        onClick={() => onSelectTransaction(trx, goal)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onSelectTransaction(trx, goal)
                          }
                        }}
                        className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#35373C]/30 -mx-2 px-2 rounded-xl transition-colors"
                      >
                        {/* Goal Icon + Type Indicator */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-[#1E1F22] flex items-center justify-center text-[#5865F2] overflow-hidden">
                            {renderGoalIcon(goal.icon, goal.customPhoto, 'w-5 h-5')}
                          </div>
                          {/* Mini Badge Icon with 3D tactile dimensional style */}
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-white ring-2 ring-[#2B2D31] select-none ${
                              isDeposit
                                ? 'bg-gradient-to-b from-[#2ECC71] to-[#1E9550] border-b-[1.5px] border-[#166E3B]'
                                : 'bg-gradient-to-b from-[#FF5C5C] to-[#D83A3E] border-b-[1.5px] border-[#961D20]'
                            }`}
                            style={{
                              boxShadow: isDeposit
                                ? 'inset 0 0.5px 1px rgba(255, 255, 255, 0.45), 0 2px 6px rgba(35, 165, 90, 0.4)'
                                : 'inset 0 0.5px 1px rgba(255, 255, 255, 0.45), 0 2px 6px rgba(242, 63, 67, 0.4)',
                            }}
                          >
                            {isDeposit ? (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-2.5 h-2.5 drop-shadow-[0_0.5px_1px_rgba(0,0,0,0.4)]"
                                fill="none"
                                stroke="white"
                                strokeWidth="3.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-2.5 h-2.5 drop-shadow-[0_0.5px_1px_rgba(0,0,0,0.4)]"
                                fill="none"
                                stroke="white"
                                strokeWidth="3.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Middle: Goal Title + Note + Date */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-[#E0E1E5] truncate">
                              {goal.title}
                            </span>
                            {goal.targetAmount > 0 && (goal.currentAmount || 0) >= goal.targetAmount && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-b from-[#2ECC71] to-[#1E9550] border-b-[2px] border-[#166E3B] text-white ring-1 ring-[#146034] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_6px_rgba(35,165,90,0.35)] shrink-0 select-none">
                                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                                  ACHIEVED
                                </span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#DBDEE1]/80 truncate mt-0.5">
                            {trx.note || (isDeposit ? 'Deposit' : 'Withdrawal')}
                          </div>
                          <div className="text-[11px] text-[#949BA4] mt-0.5 truncate">
                            {trx.walletName
                              ? `${isDeposit ? 'From' : 'To'} ${trx.walletName} • ${formattedDate}`
                              : formattedDate}
                          </div>
                        </div>

                        {/* Right: Amount & Receipt Icon */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div
                              className={`text-sm font-bold ${
                                isDeposit ? 'text-[#23A55A]' : 'text-[#F23F43]'
                              }`}
                            >
                              {isDeposit ? '+' : '-'} {formatIDR(trx.amount)}
                            </div>
                            <span className="text-[10px] text-[#949BA4] group-hover:text-[#5865F2] transition-colors">
                              View Invoice
                            </span>
                          </div>

                          <div className="text-[#949BA4] group-hover:text-[#DBDEE1] transition-colors">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
