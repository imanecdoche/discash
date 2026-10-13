import { useState, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { toPng } from 'html-to-image'
import type { GoalTransaction } from '../types/goal'
import { formatIDR } from '../utils/formatters'
import { renderGoalIcon } from './GoalIcon'
import { DiscordLogo } from './DiscordLogo'

interface TransactionReceiptSheetProps {
  isOpen: boolean
  transaction: GoalTransaction | null
  goalTitle?: string
  goalIcon?: string
  goalCustomPhoto?: string
  onClose: () => void
  onDeleteTransaction?: (transactionId: string) => void
}

export function TransactionReceiptSheet({
  isOpen,
  transaction,
  goalTitle,
  goalIcon,
  goalCustomPhoto,
  onClose,
  onDeleteTransaction,
}: TransactionReceiptSheetProps) {
  const dragControls = useDragControls()
  const receiptRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!transaction) return null

  const isDeposit = transaction.type === 'deposit'
  const formattedDate = new Date(transaction.createdAt).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const formattedTrxId = `TRX-${transaction.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`

  const handleDownloadPNG = async () => {
    if (!receiptRef.current || isDownloading) return
    setIsDownloading(true)
    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: '#1E1F22',
      })

      const link = document.createElement('a')
      link.download = `faktur-${formattedTrxId}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to export invoice PNG:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop gelap tanpa blur */}
          <motion.div
            key="receipt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 cursor-pointer z-50 pointer-events-auto"
            aria-hidden="true"
          />

          {/* Panel Sheet Faktur Digital */}
          <motion.div
            key="receipt-panel"
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
            className="fixed inset-x-0 bottom-0 mx-auto z-50 w-full max-w-[430px] max-h-[92dvh] bg-[#2B2D31] rounded-t-3xl border-t border-[#1F2023]/90 shadow-2xl flex flex-col overflow-hidden pointer-events-auto origin-top transform-gpu will-change-transform"
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-sheet-title"
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
              <h2
                id="receipt-sheet-title"
                className="discord-wordmark text-base font-bold text-[#E0E1E5] tracking-tight"
              >
                Digital Invoice
              </h2>

              <div className="flex items-center gap-1.5">
                {onDeleteTransaction && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#F23F43]/20 active:bg-[#F23F43]/30 text-[#949BA4] hover:text-[#F23F43] flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete transaction"
                    aria-label="Delete transaction"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#1E1F22] hover:bg-[#35373C] text-[#949BA4] hover:text-[#DBDEE1] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close invoice"
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
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 select-none overscroll-contain">
              {/* Captureable Invoice Card Node */}
              <div
                ref={receiptRef}
                className="w-full bg-[#1E1F22] rounded-2xl border border-[#111214]/80 p-5 flex flex-col items-center text-center shadow-lg relative overflow-hidden"
              >
                {/* Accent Top Bar */}
                <div
                  className={`absolute top-0 inset-x-0 h-1.5 ${
                    isDeposit ? 'bg-[#23A55A]' : 'bg-[#F23F43]'
                  }`}
                />

                {/* 1. Logo Ceklis Besar di Atas Tengah: Filled, Glowing, & Dimensional (Menonjol 3D) */}
                <div className="mt-2 mb-3 relative flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full bg-gradient-to-b from-[#2ECC71] to-[#1E9550] text-white flex items-center justify-center ring-4 ring-[#1E1F22] border-b-[3.5px] border-[#166E3B] select-none"
                    style={{
                      boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.45), 0 8px 24px rgba(35, 165, 90, 0.45)',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-8 h-8 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.3)]"
                      fill="none"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                {/* Status Tipe Transaksi */}
                <span className="text-xs font-bold uppercase tracking-wider text-[#949BA4]">
                  {isDeposit ? 'Budget In (Deposit)' : 'Budget Out (Withdrawal)'}
                </span>

                {/* Nominal IDR Transaksi */}
                <div
                  className={`discord-wordmark text-2xl sm:text-3xl font-black tracking-tight mt-1 mb-4 ${
                    isDeposit ? 'text-[#23A55A]' : 'text-[#F23F43]'
                  }`}
                >
                  {isDeposit ? '+' : '-'} {formatIDR(transaction.amount)}
                </div>

                {/* Dashed Separator */}
                <div className="w-full border-t border-dashed border-[#2B2D31] my-1" />

                {/* Key-Value Details */}
                <div className="w-full flex flex-col divide-y divide-[#2B2D31]/70 text-left pt-2 text-xs">
                  {/* Transaction ID */}
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-[#949BA4]">Transaction ID</span>
                    <span className="font-mono font-semibold text-[#DBDEE1]">
                      {formattedTrxId}
                    </span>
                  </div>

                  {/* Target Goal */}
                  {goalTitle && (
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-[#949BA4]">Savings Goal</span>
                      <div className="flex items-center gap-1.5 font-semibold text-[#DBDEE1] max-w-[200px] truncate">
                        {goalIcon && (
                          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                            {renderGoalIcon(goalIcon, goalCustomPhoto, 'w-4 h-4')}
                          </div>
                        )}
                        <span className="truncate">{goalTitle}</span>
                      </div>
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-[#949BA4]">Date & Time</span>
                    <span className="font-semibold text-[#DBDEE1]">
                      {formattedDate}
                    </span>
                  </div>

                  {/* Note */}
                  <div className="py-2.5 flex items-start justify-between gap-2">
                    <span className="text-[#949BA4] shrink-0">Note</span>
                    <span className="font-medium text-[#DBDEE1] text-right break-words max-w-[220px]">
                      {transaction.note || '-'}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-[#949BA4]">Status</span>
                    <span className="font-bold text-[#23A55A]">
                      Success
                    </span>
                  </div>
                </div>

                {/* Bottom Receipt Branding */}
                <div className="w-full mt-4 pt-3 border-t border-[#2B2D31]/80 flex items-center justify-between text-[11px] text-[#949BA4]">
                  <div className="flex items-center gap-1.5">
                    <DiscordLogo className="w-4 h-4" color="#5865F2" />
                    <span className="discord-wordmark font-bold text-[#DBDEE1]">
                      Discash
                    </span>
                  </div>
                  <span>Official Transaction Invoice</span>
                </div>
              </div>

              {/* Tombol Download Faktur ke PNG */}
              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={isDownloading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all select-none ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#363FA0] bg-gradient-to-b from-[#6975F7] to-[#4752C4] text-white shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(88,101,242,0.4)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[3.5px] disabled:active:scale-100 min-h-[44px]"
              >
                {isDownloading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Generating PNG...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Invoice (PNG)
                  </>
                )}
              </button>
            </div>

            {/* Delete Transaction Confirmation Dialog Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-sm bg-[#313338] border border-[#1F2023] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 select-none"
                  >
                    <div className="flex flex-col gap-1.5">
                      <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5]">
                        Delete Transaction?
                      </h3>
                      <p className="text-xs text-[#949BA4] leading-relaxed">
                        Are you sure you want to delete this {isDeposit ? 'deposit' : 'withdrawal'} record of{' '}
                        <span className="font-bold text-[#DBDEE1]">
                          {formatIDR(transaction.amount)}
                        </span>
                        {transaction.note ? ` ("${transaction.note}")` : ''}? The goal balance will be automatically reverted by{' '}
                        <span className="font-bold text-[#DBDEE1]">
                          {formatIDR(transaction.amount)}
                        </span>.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[3.5px] border-[#232428] text-[#DBDEE1] font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTransaction?.(transaction.id)
                          setShowDeleteConfirm(false)
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[3.5px] border-[#961D20] text-white font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(242,63,67,0.4)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
