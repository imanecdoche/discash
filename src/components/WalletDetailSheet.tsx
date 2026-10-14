import { useState, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { toTitleCase, formatIDR } from '../utils/formatters'
import { WALLET_PRESET_ICONS, renderGoalIcon, renderTactileOrangeStar } from './GoalIcon'
import { WalletMutationSheet } from './WalletMutationSheet'
import type { Wallet, WalletTransaction } from '../types/wallet'

interface WalletDetailSheetProps {
  isOpen: boolean
  wallet: Wallet | null
  onClose: () => void
  onUpdateWallet: (updatedWallet: Wallet) => void
  onToggleMainWallet?: (wallet: Wallet) => void
  onDeleteWallet: (walletId: string) => void
  onDeleteWalletTransaction?: (walletId: string, transactionId: string) => void
  initialMode?: 'detail' | 'edit'
}

export function WalletDetailSheet({
  isOpen,
  wallet,
  onClose,
  onUpdateWallet,
  onToggleMainWallet,
  onDeleteWallet,
  onDeleteWalletTransaction,
  initialMode = 'detail',
}: WalletDetailSheetProps) {
  const [mode, setMode] = useState<'detail' | 'edit'>(initialMode)
  const [prevOpenState, setPrevOpenState] = useState(isOpen)

  const [activeMutationType, setActiveMutationType] = useState<'topup' | 'deduct'>('topup')
  const [isMutationOpen, setIsMutationOpen] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState<WalletTransaction | null>(null)
  const [showActionPicker, setShowActionPicker] = useState(false)

  const [editName, setEditName] = useState(wallet?.name || '')
  const [editDescription, setEditDescription] = useState(wallet?.description || '')
  const [editSelectedIcon, setEditSelectedIcon] = useState(wallet?.icon || 'wallet')
  const [editCustomPhoto, setEditCustomPhoto] = useState<string | null>(wallet?.customPhoto || null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)
  const [isPickerDragging, setIsPickerDragging] = useState(false)

  if (isOpen && !prevOpenState) {
    setPrevOpenState(true)
    setMode(initialMode)
    if (initialMode === 'edit' && wallet) {
      setEditName(wallet.name)
      setEditDescription(wallet.description || '')
      setEditSelectedIcon(wallet.icon)
      setEditCustomPhoto(wallet.customPhoto || null)
    }
  } else if (!isOpen && prevOpenState) {
    setPrevOpenState(false)
  }

  const activeWallet = wallet

  const handleOpenEdit = () => {
    if (activeWallet) {
      setEditName(activeWallet.name)
      setEditDescription(activeWallet.description || '')
      setEditSelectedIcon(activeWallet.icon)
      setEditCustomPhoto(activeWallet.customPhoto || null)
    }
    setMode('edit')
  }

  const handleDismiss = () => {
    setIsDragging(false)
    setIsPickerDragging(false)
    setMode('detail')
    setIsMutationOpen(false)
    setShowDeleteConfirm(false)
    setDeletingTransaction(null)
    setShowActionPicker(false)
    onClose()
  }

  const handleConfirmMutation = (amount: number, note: string) => {
    if (!activeWallet) return

    const newTransaction: WalletTransaction = {
      id: `wtrx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      walletId: activeWallet.id,
      type: activeMutationType,
      amount,
      note,
      createdAt: new Date().toISOString(),
    }

    const updatedBalance =
      activeMutationType === 'topup'
        ? activeWallet.balance + amount
        : Math.max(0, activeWallet.balance - amount)

    const updatedWallet: Wallet = {
      ...activeWallet,
      balance: updatedBalance,
      updatedAt: new Date().toISOString(),
      transactions: [newTransaction, ...(activeWallet.transactions || [])],
    }

    onUpdateWallet(updatedWallet)
    setIsMutationOpen(false)
  }

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setEditCustomPhoto(result)
      setEditSelectedIcon('custom')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveEdit = () => {
    if (!activeWallet || !editName.trim()) return

    const updatedWallet: Wallet = {
      ...activeWallet,
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      icon: editSelectedIcon,
      customPhoto: editCustomPhoto || undefined,
      updatedAt: new Date().toISOString(),
    }

    onUpdateWallet(updatedWallet)
    setMode('detail')
  }

  const handleTogglePin = () => {
    if (!activeWallet) return
    const updatedWallet: Wallet = {
      ...activeWallet,
      isPinned: !activeWallet.isPinned,
      updatedAt: new Date().toISOString(),
    }
    onUpdateWallet(updatedWallet)
  }

  if (!activeWallet) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="wallet-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/75 cursor-pointer z-[70] pointer-events-auto"
            aria-hidden="true"
          />
        )}

        {isOpen && (
          <motion.div
            key="wallet-detail-panel"
            initial={{ y: '100%', scale: 1 }}
            animate={{
              y: isMutationOpen ? 12 : 0,
              scale: isMutationOpen ? 0.95 : 1,
            }}
            exit={{ y: '100%', scale: 1 }}
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
            className="fixed inset-x-0 bottom-0 mx-auto z-[70] w-full max-w-[430px] h-[92dvh] max-h-[820px] bg-[#2B2D31] rounded-t-3xl border-t border-[#1F2023]/90 shadow-2xl flex flex-col overflow-hidden pointer-events-auto origin-top transform-gpu will-change-transform"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-detail-title"
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
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center select-none ring-1 ring-[#1E1F22] ${
                    activeWallet.icon === 'custom' && activeWallet.customPhoto
                      ? 'border-b-[2px] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                      : 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  {renderGoalIcon(
                    activeWallet.icon,
                    activeWallet.customPhoto,
                    'w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]'
                  )}
                  {activeWallet.icon === 'custom' && activeWallet.customPhoto && (
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-xl" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <h2
                    id="wallet-detail-title"
                    className="discord-wordmark text-lg font-bold leading-none text-[#E0E1E5] tracking-tight truncate"
                  >
                    {mode === 'edit' ? 'Edit Wallet' : activeWallet.name}
                  </h2>
                  {mode === 'detail' && activeWallet.isMain && renderTactileOrangeStar('w-4 h-4')}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {mode === 'detail' ? (
                  <button
                    type="button"
                    onClick={() => setShowActionPicker(true)}
                    className="w-8 h-8 rounded-full bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] text-[#DBDEE1] ring-2 ring-[#1E1F22] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95] flex items-center justify-center transition-all cursor-pointer"
                    title="More Options"
                    aria-label="More Options"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" fill="currentColor">
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('detail')}
                    className="text-xs font-semibold text-[#949BA4] hover:text-[#E0E1E5] px-2 py-1 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[2.5px] border-[#961D20] text-white ring-2 ring-[#1E1F22] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_10px_rgba(242,63,67,0.4)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95] flex items-center justify-center transition-all cursor-pointer ml-1"
                  title="Close sheet"
                  aria-label="Close sheet"
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
            </div>

            {mode === 'detail' && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 select-none overscroll-contain">
                  {/* Available Balance Info directly on surface */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                      Available Unallocated Balance
                    </span>
                    <div className="discord-wordmark text-3xl font-black text-[#E0E1E5] tracking-tight">
                      {formatIDR(activeWallet.balance || 0)}
                    </div>
                    {activeWallet.description && (
                      <p className="text-xs text-[#949BA4] leading-relaxed pt-2 border-t border-[#1F2023]/60 mt-1">
                        {activeWallet.description}
                      </p>
                    )}
                  </div>

                  {/* Wallet Transaction History */}
                  <div className="flex flex-col gap-2.5 pt-3 border-t border-[#1F2023]/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                        Wallet History
                      </span>
                      {activeWallet.transactions && activeWallet.transactions.length > 0 && (
                        <span className="text-xs font-semibold text-[#949BA4]">
                          {activeWallet.transactions.length} record{activeWallet.transactions.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {!activeWallet.transactions || activeWallet.transactions.length === 0 ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="mb-2 text-[#949BA4]">
                          <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#949BA4]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-[#DBDEE1]">
                          No Wallet Transactions Yet
                        </span>
                        <p className="text-xs text-[#949BA4] max-w-[230px] mt-0.5 leading-relaxed">
                          Top ups, deductions, and goal allocations from this wallet will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-[#1F2023]/60">
                        {activeWallet.transactions.map((trx) => {
                          const isPositive = trx.type === 'topup' || trx.type === 'goal_withdraw'
                          const formattedDate = new Date(trx.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })

                          return (
                            <div
                              key={trx.id}
                              className="py-3 flex items-center justify-between gap-3 group -mx-2 px-2 rounded-xl hover:bg-[#35373C]/30 transition-colors select-none"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 select-none ${
                                  isPositive
                                    ? 'bg-gradient-to-b from-[#2ECC71] to-[#1E9550] text-white ring-2 ring-[#1E1F22] border-b-2 border-[#166E3B]'
                                    : 'bg-gradient-to-b from-[#FF5C5C] to-[#D83A3E] text-white ring-2 ring-[#1E1F22] border-b-2 border-[#961D20]'
                                }`}
                                style={{
                                  boxShadow: isPositive
                                    ? 'inset 0 1px 1.5px rgba(255, 255, 255, 0.45), 0 4px 12px rgba(35, 165, 90, 0.35)'
                                    : 'inset 0 1px 1.5px rgba(255, 255, 255, 0.45), 0 4px 12px rgba(242, 63, 67, 0.35)',
                                }}
                              >
                                {isPositive ? (
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                ) : (
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#E0E1E5] truncate">
                                  {trx.note}
                                </div>
                                <div className="text-[11px] text-[#949BA4] truncate">
                                  {trx.relatedGoalTitle
                                    ? `${trx.type === 'goal_deposit' ? 'To Goal:' : 'From Goal:'} ${trx.relatedGoalTitle} • ${formattedDate}`
                                    : formattedDate}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-sm font-bold ${
                                    isPositive ? 'text-[#23A55A]' : 'text-[#F23F43]'
                                  }`}
                                >
                                  {isPositive ? '+' : '-'} {formatIDR(trx.amount)}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => setDeletingTransaction(trx)}
                                  className="w-6 h-6 rounded text-[#949BA4] hover:text-[#F23F43] flex items-center justify-center transition-colors cursor-pointer"
                                  title="Delete transaction"
                                  aria-label="Delete transaction"
                                >
                                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sticky Bottom Actions: Add Balance & Deduct */}
                <div className="sticky bottom-0 bg-[#2B2D31] px-5 pt-3 pb-5 border-t border-[#1F2023]/80 flex items-center gap-3 shrink-0 select-none z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMutationType('topup')
                      setIsMutationOpen(true)
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] bg-gradient-to-b from-[#2ECC71] via-[#23A55A] to-[#1E9550] border-b-[3.5px] border-[#166E3B] text-white ring-2 ring-[#1E1F22] select-none min-h-[46px]"
                    style={{
                      boxShadow:
                        'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(35, 165, 90, 0.4)',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]">Add Balance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveMutationType('deduct')
                      setIsMutationOpen(true)
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] bg-gradient-to-b from-[#FFA133] via-[#FF7A00] to-[#E56200] border-b-[3.5px] border-[#A84400] text-white ring-2 ring-[#1E1F22] select-none min-h-[46px]"
                    style={{
                      boxShadow:
                        'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(255, 122, 0, 0.4)',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]">Deduct</span>
                  </button>
                </div>
              </>
            )}

            {mode === 'edit' && (
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 select-none overscroll-contain">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-wallet-name"
                    className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
                  >
                    Wallet Name <span className="text-[#ED4245]">*</span>
                  </label>
                  <input
                    id="edit-wallet-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(toTitleCase(e.target.value))}
                    placeholder="e.g. BCA Main, GoPay"
                    className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg px-3.5 py-2.5 text-sm text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-wallet-desc"
                    className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
                  >
                    Description <span className="text-[10px] lowercase font-normal text-[#949BA4]/80">(optional)</span>
                  </label>
                  <textarea
                    id="edit-wallet-desc"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Notes about this wallet..."
                    rows={2}
                    className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg px-3.5 py-2.5 text-sm text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none resize-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                    Wallet Icon / Photo
                  </label>

                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {WALLET_PRESET_ICONS.map((preset) => {
                      const isSelected = editSelectedIcon === preset.id && !editCustomPhoto
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setEditSelectedIcon(preset.id)
                            setEditCustomPhoto(null)
                          }}
                          className={`h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/30 ring-2 ring-[#5865F2]'
                              : 'bg-[#1E1F22] text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#232428]'
                          }`}
                          title={preset.label}
                        >
                          {renderGoalIcon(preset.id, undefined, 'w-5 h-5')}
                        </button>
                      )
                    })}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                        editSelectedIcon === 'custom' && editCustomPhoto
                          ? 'ring-2 ring-[#5865F2] bg-[#1E1F22]'
                          : 'bg-[#1E1F22] text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#232428]'
                      }`}
                      title="Upload Custom Photo"
                    >
                      {editCustomPhoto ? (
                        <img
                          src={editCustomPhoto}
                          alt="Custom Wallet Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditPhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 bg-[#2B2D31] pt-3 pb-4 border-t border-[#1F2023]/80 flex items-center gap-3 shrink-0 mt-auto select-none">
                  <button
                    type="button"
                    onClick={() => setMode('detail')}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[3.5px] border-[#232428] text-[#DBDEE1] font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!editName.trim()}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[3.5px] border-[#363FA0] text-white font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(88,101,242,0.4)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[3.5px] disabled:active:scale-100 transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Option Action Picker Bottom Sheet inside WalletDetailSheet */}
            <AnimatePresence>
              {showActionPicker && (
                <div
                  className="fixed inset-0 z-[75] bg-black/75 flex flex-col justify-end"
                  onClick={() => setShowActionPicker(false)}
                >
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                    drag="y"
                    dragConstraints={{ top: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      setIsPickerDragging(false)
                      if (info.offset.y > 60 || info.velocity.y > 300) {
                        setShowActionPicker(false)
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-[430px] mx-auto bg-[#2B2D31] rounded-t-3xl border-t border-[#1F2023] shadow-2xl flex flex-col overflow-hidden select-none"
                  >
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
                      />
                    </div>

                    <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-[#1F2023]/60 shrink-0 select-none">
                      <div className="flex flex-col min-w-0">
                        <h3 className="discord-wordmark text-base font-bold text-[#E0E1E5] tracking-tight truncate">
                          Wallet Options
                        </h3>
                        <span className="text-[11px] text-[#949BA4] truncate">
                          {activeWallet.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowActionPicker(false)}
                        className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[2.5px] border-[#961D20] text-white ring-2 ring-[#1E1F22] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_10px_rgba(242,63,67,0.4)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95] flex items-center justify-center transition-all cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-4 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionPicker(false)
                          onToggleMainWallet?.(activeWallet)
                        }}
                        className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-[#1F2023]/60 transition-all text-left cursor-pointer active:scale-[0.99]"
                      >
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            activeWallet.isMain
                              ? 'bg-gradient-to-b from-[#FFA133] via-[#FF7A00] to-[#E56200] border-b-[2.5px] border-[#A84400] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,122,0,0.4)]'
                              : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#FF7A00] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)]'
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            fill={activeWallet.isMain ? 'currentColor' : 'none'}
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
                            {activeWallet.isMain ? 'Remove Main Status' : 'Set as Main Wallet'}
                          </span>
                          <span className="text-xs text-[#949BA4]">
                            {activeWallet.isMain
                              ? 'Unset this wallet as primary funding source'
                              : 'Make this your primary wallet for goal allocations'}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowActionPicker(false)
                          handleTogglePin()
                        }}
                        className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-[#1F2023]/60 transition-all text-left cursor-pointer active:scale-[0.99]"
                      >
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            activeWallet.isPinned
                              ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2.5px] border-[#363FA0] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_4px_12px_rgba(88,101,242,0.35)]'
                              : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)]'
                          }`}
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill={activeWallet.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 12V4h1V2H7v2h1v8l-2 3v2h5v5l1 1 1-1v-5h5v-2l-2-3Z" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold text-[#E0E1E5]">
                            {activeWallet.isPinned ? 'Unpin Wallet' : 'Pin Wallet'}
                          </span>
                          <span className="text-xs text-[#949BA4]">
                            {activeWallet.isPinned ? 'Remove from top of list' : 'Keep wallet at top of list'}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowActionPicker(false)
                          handleOpenEdit()
                        }}
                        className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-[#1F2023]/60 transition-all text-left cursor-pointer active:scale-[0.99]"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold text-[#E0E1E5]">Edit Wallet</span>
                          <span className="text-xs text-[#949BA4]">Modify wallet name, description, or icon</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowActionPicker(false)
                          setShowDeleteConfirm(true)
                        }}
                        className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#DA373C]/[0.08] hover:bg-[#DA373C]/[0.15] active:bg-[#DA373C]/[0.22] border border-[#DA373C]/30 transition-all text-left cursor-pointer active:scale-[0.99]"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[2.5px] border-[#961D20] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_8px_rgba(218,55,60,0.4)] flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold text-[#FF5C5C]">Delete Wallet</span>
                          <span className="text-xs text-[#949BA4]">Permanently remove this wallet</span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Delete Wallet Confirmation Dialog */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm bg-[#313338] border border-[#1F2023] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 select-none"
                  >
                    <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5]">
                      Delete Wallet?
                    </h3>
                    <p className="text-xs text-[#949BA4] leading-relaxed">
                      Are you sure you want to delete{' '}
                      <strong className="text-[#E0E1E5]">"{activeWallet.name}"</strong>?
                      Your goals will keep their allocated funds, but this wallet will be removed.
                    </p>
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
                          onDeleteWallet(activeWallet.id)
                          handleDismiss()
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

            {/* Delete Wallet Transaction Confirmation Dialog */}
            <AnimatePresence>
              {deletingTransaction && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm bg-[#313338] border border-[#1F2023] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 select-none"
                  >
                    <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5]">
                      Delete Transaction?
                    </h3>
                    <p className="text-xs text-[#949BA4] leading-relaxed">
                      Are you sure you want to delete this record of{' '}
                      <span className="font-bold text-[#DBDEE1]">
                        {formatIDR(deletingTransaction.amount)}
                      </span>
                      ? The wallet balance{deletingTransaction.relatedGoalId ? ' and linked goal balance' : ''} will be automatically reverted.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setDeletingTransaction(null)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[3.5px] border-[#232428] text-[#DBDEE1] font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteWalletTransaction?.(activeWallet.id, deletingTransaction.id)
                          setDeletingTransaction(null)
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
        )}
      </AnimatePresence>

      <WalletMutationSheet
        isOpen={isMutationOpen}
        type={activeMutationType}
        currentBalance={activeWallet.balance || 0}
        walletName={activeWallet.name}
        onClose={() => setIsMutationOpen(false)}
        onConfirm={handleConfirmMutation}
      />
    </>
  )
}
