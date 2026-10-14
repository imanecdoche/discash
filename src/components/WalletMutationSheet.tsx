import { useState, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { formatNumberInput, formatIDR } from '../utils/formatters'

interface WalletMutationSheetProps {
  isOpen: boolean
  type: 'topup' | 'deduct'
  currentBalance: number
  walletName: string
  onClose: () => void
  onConfirm: (amount: number, note: string) => void
}

export function WalletMutationSheet({
  isOpen,
  type,
  currentBalance,
  walletName,
  onClose,
  onConfirm,
}: WalletMutationSheetProps) {
  const [amountString, setAmountString] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)
  const amountInputRef = useRef<HTMLInputElement | null>(null)

  const resetForm = () => {
    setIsDragging(false)
    setAmountString('')
    setNote('')
    setError(null)
  }

  const handleDismiss = () => {
    resetForm()
    onClose()
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountString(formatNumberInput(e.target.value))
    setError(null)
  }

  const isTopUp = type === 'topup'
  const rawAmount = Number(amountString.replace(/\D/g, ''))
  const isExceedingBalance = !isTopUp && rawAmount > currentBalance

  const handleSubmit = () => {
    if (rawAmount <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    if (!isTopUp && rawAmount > currentBalance) {
      setError(`Deduction exceeds current wallet balance (${formatIDR(currentBalance)})`)
      return
    }

    const finalNote = note.trim() || (isTopUp ? 'Balance Top Up' : 'Wallet Deduction')

    onConfirm(rawAmount, finalNote)
    resetForm()
    onClose()
  }

  const title = isTopUp ? 'Add Wallet Balance (+)' : 'Deduct Wallet Balance (-)'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="wallet-mutation-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/75 cursor-pointer z-[80] pointer-events-auto"
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <motion.div
          key="wallet-mutation-panel"
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
              handleDismiss()
            }
          }}
          className="fixed inset-x-0 bottom-0 mx-auto z-[80] w-full max-w-[430px] h-[78dvh] max-h-[700px] bg-[#2B2D31] rounded-t-3xl border-t border-[#1F2023]/90 shadow-2xl flex flex-col overflow-hidden pointer-events-auto transform-gpu will-change-transform"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-mutation-sheet-title"
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
            <div className="flex flex-col min-w-0">
              <h2
                id="wallet-mutation-sheet-title"
                className="discord-wordmark text-lg font-bold text-[#E0E1E5] tracking-tight"
              >
                {title}
              </h2>
              <span className="text-[11px] text-[#949BA4] truncate">
                {walletName} • Available: {formatIDR(currentBalance)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-semibold text-[#949BA4] hover:text-[#E0E1E5] px-2 py-1 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Form Body directly on #2B2D31 surface */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 select-none overscroll-contain">
            {/* Field 1: Amount (IDR) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="wallet-mutation-amount"
                  className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
                >
                  Amount (IDR)
                </label>
                {!isTopUp && currentBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAmountString(formatNumberInput(currentBalance.toString()))
                      setError(null)
                    }}
                    className="text-[11px] font-bold text-[#5865F2] hover:text-[#7983F5] transition-colors cursor-pointer"
                  >
                    Use Max ({formatIDR(currentBalance)})
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-bold text-[#949BA4] select-none pointer-events-none">
                  IDR
                </span>
                <input
                  ref={amountInputRef}
                  id="wallet-mutation-amount"
                  type="text"
                  inputMode="numeric"
                  value={amountString}
                  onChange={handleAmountChange}
                  placeholder="100,000"
                  className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg pl-14 pr-3.5 py-2.5 text-base font-semibold text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Field 2: Note (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="wallet-mutation-note"
                className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
              >
                Note <span className="text-[10px] lowercase font-normal text-[#949BA4]/80">(optional)</span>
              </label>
              <input
                id="wallet-mutation-note"
                type="text"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value)
                  setError(null)
                }}
                placeholder={
                  isTopUp
                    ? 'e.g. Monthly salary, Freelance income'
                    : 'e.g. Daily expenses, Bill payment'
                }
                className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg px-3.5 py-2.5 text-sm text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-colors"
              />
            </div>

            {/* Error State */}
            {(error || isExceedingBalance) && (
              <div className="text-xs text-[#F23F43] font-medium leading-relaxed">
                {error || `Deduction exceeds current wallet balance (${formatIDR(currentBalance)})`}
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="sticky bottom-0 bg-[#2B2D31] px-5 py-3 pb-8 border-t border-[#1F2023]/80 flex items-center gap-3 shrink-0 mt-auto select-none">
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[3.5px] border-[#232428] text-[#DBDEE1] font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!amountString.trim() || rawAmount <= 0 || isExceedingBalance}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm ring-2 ring-[#1E1F22] border-b-[3.5px] transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[3.5px] disabled:active:scale-100 active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] ${
                isTopUp
                  ? 'bg-gradient-to-b from-[#2ECC71] via-[#23A55A] to-[#1E9550] border-[#166E3B] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(35,165,90,0.4)]'
                  : 'bg-gradient-to-b from-[#FFA133] via-[#FF7A00] to-[#E56200] border-[#A84400] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(255,122,0,0.4)]'
              }`}
            >
              {isTopUp ? 'Add Balance' : 'Deduct'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
