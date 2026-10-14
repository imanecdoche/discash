import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Wallet } from '../types/wallet'
import { renderGoalIcon, renderTactileOrangeStar } from './GoalIcon'
import { formatIDR } from '../utils/formatters'

export interface WalletActionPickerSheetProps {
  isOpen: boolean
  wallet: Wallet | null
  onClose: () => void
  onToggleMain?: (wallet: Wallet) => void
  onTogglePin?: (wallet: Wallet) => void
  onEdit?: (wallet: Wallet) => void
  onDelete?: (walletId: string) => void
}

export function WalletActionPickerSheet({
  isOpen,
  wallet,
  onClose,
  onToggleMain,
  onTogglePin,
  onEdit,
  onDelete,
}: WalletActionPickerSheetProps) {
  const [isPickerDragging, setIsPickerDragging] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!wallet) return null

  const handleConfirmDelete = () => {
    onDelete?.(wallet.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="wallet-action-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/75 z-[70] cursor-pointer"
              aria-hidden="true"
            />

            <div className="fixed inset-0 z-[71] pointer-events-none flex justify-center items-end select-none">
              <motion.div
                key="wallet-action-panel"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{
                  type: 'spring',
                  damping: 30,
                  stiffness: 350,
                  mass: 0.8,
                }}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_e, info) => {
                  if (info.offset.y > 80 || info.velocity.y > 400) {
                    onClose()
                  }
                  setIsPickerDragging(false)
                }}
                className="w-full max-w-[430px] bg-[#2B2D31] border-t border-x border-[#1F2023] rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.7)] flex flex-col max-h-[85vh] overflow-hidden pointer-events-auto"
              >
                {/* Top Drag Handle */}
                <div
                  onPointerDown={() => setIsPickerDragging(true)}
                  onPointerUp={() => setIsPickerDragging(false)}
                  onPointerCancel={() => setIsPickerDragging(false)}
                  className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none shrink-0 select-none"
                >
                  <div
                    className={`h-2 rounded-full border-b-[2px] ring-1 ring-[#17181B] transition-all duration-250 ease-out select-none ${
                      isPickerDragging
                        ? 'w-20 bg-gradient-to-b from-[#727782] to-[#454852] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),0_2px_8px_rgba(0,0,0,0.6)]'
                        : 'w-12 bg-gradient-to-b from-[#5E626B] to-[#383A40] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_2px_5px_rgba(0,0,0,0.5)]'
                    }`}
                    title="Drag down to close"
                  />
                </div>

                {/* Sheet Header */}
                <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-[#1F2023]/60 shrink-0 select-none">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center select-none ring-1 ring-[#1E1F22] ${
                        wallet.icon === 'custom' && wallet.customPhoto
                          ? 'border-b-[2px] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                          : 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                      }`}
                    >
                      {renderGoalIcon(
                        wallet.icon,
                        wallet.customPhoto,
                        'w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]'
                      )}
                      {wallet.icon === 'custom' && wallet.customPhoto && (
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-xl" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="discord-wordmark text-base font-bold text-[#E0E1E5] tracking-tight truncate">
                        Wallet Options
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-[#949BA4] truncate">
                        <span className="truncate">{wallet.name}</span>
                        {wallet.isMain && renderTactileOrangeStar('w-3.5 h-3.5')}
                        <span>• {formatIDR(wallet.balance)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tactile 3D Red Close Button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[2.5px] border-[#961D20] text-white ring-2 ring-[#1E1F22] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_10px_rgba(242,63,67,0.4)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95] flex items-center justify-center transition-all cursor-pointer"
                    title="Close options"
                    aria-label="Close options"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Action Options List */}
                <div className="p-4 flex flex-col gap-2 overflow-y-auto overscroll-contain">
                  {/* 0. Set / Remove Main Wallet */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onToggleMain?.(wallet)
                    }}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-[#1F2023]/60 transition-all text-left cursor-pointer active:scale-[0.99] group"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        wallet.isMain
                          ? 'bg-gradient-to-b from-[#FFA133] via-[#FF7A00] to-[#E56200] border-b-[2.5px] border-[#A84400] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,122,0,0.4)]'
                          : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#FF7A00] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)]'
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                        fill={wallet.isMain ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-[#E0E1E5]">
                        {wallet.isMain ? 'Remove Main Status' : 'Set as Main Wallet'}
                      </span>
                      <span className="text-xs text-[#949BA4]">
                        {wallet.isMain
                          ? 'Unset this wallet as primary funding source'
                          : 'Make this your primary wallet for goal allocations'}
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-[#949BA4] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* 1. Pin / Unpin Wallet */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onTogglePin?.(wallet)
                    }}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-[#1F2023]/60 transition-all text-left cursor-pointer active:scale-[0.99] group"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        wallet.isPinned
                          ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2.5px] border-[#363FA0] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_4px_12px_rgba(88,101,242,0.35)]'
                          : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)]'
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                        fill={wallet.isPinned ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 12V4h1V2H7v2h1v8l-2 3v2h5v5l1 1 1-1v-5h5v-2l-2-3Z" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-[#E0E1E5]">
                        {wallet.isPinned ? 'Unpin Wallet' : 'Pin Wallet'}
                      </span>
                      <span className="text-xs text-[#949BA4]">
                        {wallet.isPinned
                          ? 'Remove from top of wallets list'
                          : 'Keep wallet at top of list'}
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-[#949BA4] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* 2. Edit Wallet */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onEdit?.(wallet)
                    }}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-[#1F2023]/60 transition-all text-left cursor-pointer active:scale-[0.99] group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] flex items-center justify-center shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-[#E0E1E5]">
                        Edit Wallet
                      </span>
                      <span className="text-xs text-[#949BA4]">
                        Modify wallet name, description, or icon
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-[#949BA4] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* 3. Delete Wallet */}
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#DA373C]/[0.08] hover:bg-[#DA373C]/[0.15] active:bg-[#DA373C]/[0.22] border border-[#DA373C]/30 transition-all text-left cursor-pointer active:scale-[0.99] group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[2.5px] border-[#961D20] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_8px_rgba(218,55,60,0.4)] flex items-center justify-center shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-[#FF5C5C]">
                        Delete Wallet
                      </span>
                      <span className="text-xs text-[#949BA4]">
                        Permanently remove this wallet and history
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-[#DA373C] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Wallet Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#313338] border border-[#1F2023] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 z-10 select-none"
            >
              <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5]">
                Delete Wallet?
              </h3>
              <p className="text-sm text-[#949BA4] leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-[#E0E1E5] font-semibold">
                  "{wallet.name}"
                </strong>
                ? Existing goal allocations from this wallet will remain safe in your goals, but this wallet and its history will be removed.
              </p>
              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-1 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_2px_6px_rgba(0,0,0,0.3)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98] text-sm font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[2.5px] border-[#961D20] ring-1 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_8px_rgba(218,55,60,0.4)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98] text-sm font-bold transition-all cursor-pointer"
                >
                  Delete Wallet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
