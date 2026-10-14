import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { toPng } from 'html-to-image'
import { toTitleCase, formatNumberInput, formatIDR } from '../utils/formatters'
import { PRESET_ICONS, renderGoalIcon } from './GoalIcon'
import { GoalMutationSheet } from './GoalMutationSheet'
import { DiscordLogo } from './DiscordLogo'
import type { Goal, GoalTransaction } from '../types/goal'
import type { Wallet } from '../types/wallet'

interface GoalDetailSheetProps {
  isOpen: boolean
  goal: Goal | null
  wallets?: Wallet[]
  onClose: () => void
  onUpdateGoal: (updatedGoal: Goal) => void
  onDeleteGoal: (goalId: string) => void
  onRecordGoalMutation?: (
    goal: Goal,
    type: 'deposit' | 'withdraw',
    amount: number,
    note: string,
    selectedWalletId?: string
  ) => void
  onDeleteGoalTransaction?: (goalId: string, transactionId: string) => void
  onSelectTransaction?: (transaction: GoalTransaction, goal: Goal) => void
  onOpenNewWallet?: () => void
  initialMode?: SheetMode
}

type SheetMode = 'detail' | 'edit'

export function GoalDetailSheet({
  isOpen,
  goal,
  wallets = [],
  onClose,
  onUpdateGoal,
  onDeleteGoal,
  onRecordGoalMutation,
  onDeleteGoalTransaction,
  onSelectTransaction,
  onOpenNewWallet,
  initialMode = 'detail',
}: GoalDetailSheetProps) {
  const [mode, setMode] = useState<SheetMode>(initialMode)
  const [prevOpenState, setPrevOpenState] = useState(isOpen)

  // Mutation sheet state (Add / Withdraw)
  const [activeMutationType, setActiveMutationType] = useState<'deposit' | 'withdraw'>('deposit')
  const [isMutationOpen, setIsMutationOpen] = useState(false)

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState<GoalTransaction | null>(null)

  // Action picker modal state (Three dots menu)
  const [showActionPicker, setShowActionPicker] = useState(false)

  // Edit Goal form state
  const [editTitle, setEditTitle] = useState(goal?.title || '')
  const [editDescription, setEditDescription] = useState(goal?.description || '')
  const [editTargetAmountString, setEditTargetAmountString] = useState(
    goal ? formatNumberInput(goal.targetAmount.toString()) : ''
  )
  const [editSelectedIcon, setEditSelectedIcon] = useState(goal?.icon || 'goal')
  const [editCustomPhoto, setEditCustomPhoto] = useState<string | null>(goal?.customPhoto || null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const exportCardRef = useRef<HTMLDivElement | null>(null)

  // Sync state when sheet transitions from closed to open
  if (isOpen && !prevOpenState) {
    setPrevOpenState(true)
    setMode(initialMode)
    if (initialMode === 'edit' && goal) {
      setEditTitle(goal.title)
      setEditDescription(goal.description || '')
      setEditTargetAmountString(formatNumberInput(goal.targetAmount.toString()))
      setEditSelectedIcon(goal.icon)
      setEditCustomPhoto(goal.customPhoto || null)
    }
  } else if (!isOpen && prevOpenState) {
    setPrevOpenState(false)
  }
  const [isExporting, setIsExporting] = useState(false)
  const [exportDate] = useState(() =>
    new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  )
  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)
  const [isPickerDragging, setIsPickerDragging] = useState(false)

  const activeGoal = goal

  const handleDownloadPNG = async () => {
    if (!exportCardRef.current || !activeGoal || isExporting) return
    setIsExporting(true)
    try {
      const dataUrl = await toPng(exportCardRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: '#2B2D31',
        style: {
          position: 'static',
          left: '0',
          top: '0',
          margin: '0',
          transform: 'none',
        },
      })

      const sanitizedTitle = activeGoal.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'goal'

      const link = document.createElement('a')
      link.download = `progress-${sanitizedTitle}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to export goal progress PNG:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleOpenEdit = () => {
    if (activeGoal) {
      setEditTitle(activeGoal.title)
      setEditDescription(activeGoal.description || '')
      setEditTargetAmountString(formatNumberInput(activeGoal.targetAmount.toString()))
      setEditSelectedIcon(activeGoal.icon)
      setEditCustomPhoto(activeGoal.customPhoto || null)
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

  // --- Handlers for Mutations (Deposit / Withdraw via Dedicated Sheet) ---
  const handleConfirmMutation = (
    amount: number,
    note: string,
    selectedWalletId?: string
  ) => {
    if (!activeGoal) return

    if (onRecordGoalMutation) {
      onRecordGoalMutation(activeGoal, activeMutationType, amount, note, selectedWalletId)
      setIsMutationOpen(false)
      return
    }

    const newTransaction: GoalTransaction = {
      id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      goalId: activeGoal.id,
      type: activeMutationType,
      amount,
      note,
      createdAt: new Date().toISOString(),
    }

    const updatedCurrentAmount =
      activeMutationType === 'deposit'
        ? activeGoal.currentAmount + amount
        : Math.max(0, activeGoal.currentAmount - amount)

    const updatedGoal: Goal = {
      ...activeGoal,
      currentAmount: updatedCurrentAmount,
      updatedAt: new Date().toISOString(),
      transactions: [newTransaction, ...(activeGoal.transactions || [])],
    }

    onUpdateGoal(updatedGoal)
    setIsMutationOpen(false)
  }

  const handleDeleteTransaction = useCallback(
    (transactionId: string) => {
      if (!activeGoal) return
      if (onDeleteGoalTransaction) {
        onDeleteGoalTransaction(activeGoal.id, transactionId)
        return
      }
      const targetTrx = (activeGoal.transactions || []).find((t) => t.id === transactionId)
      if (!targetTrx) return

      // Revert balance based on transaction type
      const revertedCurrentAmount =
        targetTrx.type === 'deposit'
          ? Math.max(0, activeGoal.currentAmount - targetTrx.amount)
          : activeGoal.currentAmount + targetTrx.amount

      const updatedGoal: Goal = {
        ...activeGoal,
        currentAmount: revertedCurrentAmount,
        updatedAt: new Date().toISOString(),
        transactions: (activeGoal.transactions || []).filter((t) => t.id !== transactionId),
      }

      onUpdateGoal(updatedGoal)
    },
    [activeGoal, onDeleteGoalTransaction, onUpdateGoal]
  )

  // --- Handlers for Edit Goal ---
  const handleEditTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(toTitleCase(e.target.value))
  }

  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTargetAmountString(formatNumberInput(e.target.value))
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
    if (!activeGoal) return
    const rawTarget = Number(editTargetAmountString.replace(/\D/g, ''))
    if (!editTitle.trim() || rawTarget <= 0) return

    const updatedGoal: Goal = {
      ...activeGoal,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      targetAmount: rawTarget,
      icon: editSelectedIcon,
      customPhoto: editCustomPhoto || undefined,
      updatedAt: new Date().toISOString(),
    }

    onUpdateGoal(updatedGoal)
    setMode('detail')
  }

  // --- Handler for Toggling Pin Status ---
  const handleTogglePin = () => {
    if (!activeGoal) return
    const updatedGoal: Goal = {
      ...activeGoal,
      isPinned: !activeGoal.isPinned,
      updatedAt: new Date().toISOString(),
    }
    onUpdateGoal(updatedGoal)
  }

  // --- Handler for Toggling Archive Status ---
  const handleToggleArchive = () => {
    if (!activeGoal) return
    const updatedGoal: Goal = {
      ...activeGoal,
      isArchived: !activeGoal.isArchived,
      updatedAt: new Date().toISOString(),
    }
    onUpdateGoal(updatedGoal)
    handleDismiss()
  }

  // --- Handlers for Delete Goal ---
  const handleConfirmDelete = () => {
    if (!activeGoal) return
    onDeleteGoal(activeGoal.id)
    handleDismiss()
  }

  if (!activeGoal) return null

  const percent = Math.round(
    ((activeGoal.currentAmount || 0) / (activeGoal.targetAmount || 1)) * 100
  )

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="goal-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/75 cursor-pointer z-50 pointer-events-auto"
            aria-hidden="true"
          />
        )}

        {isOpen && (
          <motion.div
            key="goal-detail-panel"
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
            className="fixed inset-x-0 bottom-0 mx-auto z-50 w-full max-w-[430px] h-[92dvh] max-h-[820px] bg-[#2B2D31] rounded-t-3xl border-t border-[#1F2023]/90 shadow-2xl flex flex-col overflow-hidden pointer-events-auto origin-top transform-gpu will-change-transform"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-detail-title"
          >
              {/* Top Drag Handle Panel */}
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
                  <div className={`w-8 h-8 rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center select-none ring-1 ring-[#1E1F22] ${
                    activeGoal.icon === 'custom' && activeGoal.customPhoto
                      ? 'border-b-[2px] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                      : percent >= 100
                      ? 'bg-gradient-to-b from-[#2ECC71] to-[#1E9550] border-b-[2px] border-[#166E3B] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_2px_6px_rgba(35,165,90,0.35)]'
                      : 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                  }`}>
                    {renderGoalIcon(activeGoal.icon, activeGoal.customPhoto, 'w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]')}
                    {activeGoal.icon === 'custom' && activeGoal.customPhoto && (
                      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-xl" />
                    )}
                  </div>
                  <h2
                    id="goal-detail-title"
                    className="discord-wordmark text-lg font-bold text-[#E0E1E5] tracking-tight truncate"
                  >
                    {mode === 'edit' ? 'Edit Goal' : activeGoal.title}
                  </h2>
                  {mode === 'detail' && percent >= 100 && (
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

              {/* Action Buttons: Tactile 3D Three Dots (Options) & Tactile 3D Red Close */}
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

                {/* Tactile 3D Red Close Button */}
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

            {/* Mode: Detail View */}
            {mode === 'detail' && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 select-none overscroll-contain">
                {/* 1. Goal Summary Information */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                        Collected
                      </span>
                      <div className="discord-wordmark text-2xl font-black text-[#E0E1E5] tracking-tight">
                        {formatIDR(activeGoal.currentAmount || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                        Target Budget
                      </span>
                      <div className="text-sm font-bold text-[#DBDEE1]">
                        {formatIDR(activeGoal.targetAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Percentage - Tactile 3D Style */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div
                      className="w-full h-3.5 rounded-full bg-[#1A1B1E] border border-[#141517] p-[1.5px] overflow-hidden"
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.7), 0 1px 1px rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 relative ${
                          percent >= 100
                            ? 'bg-gradient-to-r from-[#2ECC71] via-[#23A55A] to-[#1E9550] border-b-[2px] border-[#166E3B]'
                            : 'bg-gradient-to-b from-[#7983F5] via-[#5865F2] to-[#4752C4] border-b-[2px] border-[#31378A]'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(percent > 0 ? 3 : 0, percent))}%`,
                          boxShadow:
                            percent >= 100
                              ? 'inset 0 1.5px 1px rgba(255, 255, 255, 0.55), 0 2px 8px rgba(35, 165, 90, 0.45)'
                              : 'inset 0 1.5px 1px rgba(255, 255, 255, 0.55), 0 2px 8px rgba(88, 101, 242, 0.45)',
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-[#949BA4]">
                      <span>Progress</span>
                      <span className={`font-semibold ${percent >= 100 ? 'text-[#2ECC71]' : 'text-[#DBDEE1]'}`}>{percent}%</span>
                    </div>
                  </div>

                  {/* Optional Goal Description */}
                  {activeGoal.description && (
                    <p className="text-xs text-[#949BA4] leading-relaxed pt-1 border-t border-[#1F2023]/60 mt-1">
                      {activeGoal.description}
                    </p>
                  )}
                </div>

                {/* 2. Riwayat Record Mutasi / Transaksi (Transaction History) */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-[#1F2023]/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                      Transaction History
                    </span>
                    {activeGoal.transactions && activeGoal.transactions.length > 0 && (
                      <span className="text-xs font-semibold text-[#949BA4]">
                        {activeGoal.transactions.length} record{activeGoal.transactions.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Empty state riwayat transaksi (tanpa box & tanpa warna ungu) */}
                  {(!activeGoal.transactions || activeGoal.transactions.length === 0) ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <div className="mb-2 text-[#949BA4]">
                        <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#949BA4]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-[#DBDEE1]">
                        No Transactions Yet
                      </span>
                      <p className="text-xs text-[#949BA4] max-w-[220px] mt-0.5 leading-relaxed">
                        Tap Add Funds or Withdraw above to record your first transaction.
                      </p>
                    </div>
                  ) : (
                    /* Transaction List (Direct on surface with subtle dividers) */
                    <div className="flex flex-col divide-y divide-[#1F2023]/60">
                      {activeGoal.transactions.map((trx) => {
                        const isDeposit = trx.type === 'deposit'
                        const formattedDate = new Date(trx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })

                        return (
                          <div
                            key={trx.id}
                            onClick={() => onSelectTransaction?.(trx, activeGoal)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                onSelectTransaction?.(trx, activeGoal)
                              }
                            }}
                            className="py-3 flex items-center justify-between gap-3 group -mx-2 px-2 rounded-xl hover:bg-[#35373C]/30 transition-colors cursor-pointer select-none"
                          >
                            {/* Icon Indicator (+ or -) with 3D tactile dimensional style */}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 select-none ${
                                isDeposit
                                  ? 'bg-gradient-to-b from-[#2ECC71] to-[#1E9550] text-white ring-2 ring-[#1E1F22] border-b-2 border-[#166E3B]'
                                  : 'bg-gradient-to-b from-[#FF5C5C] to-[#D83A3E] text-white ring-2 ring-[#1E1F22] border-b-2 border-[#961D20]'
                              }`}
                              style={{
                                boxShadow: isDeposit
                                  ? 'inset 0 1px 1.5px rgba(255, 255, 255, 0.45), 0 4px 12px rgba(35, 165, 90, 0.35)'
                                  : 'inset 0 1px 1.5px rgba(255, 255, 255, 0.45), 0 4px 12px rgba(242, 63, 67, 0.35)',
                              }}
                            >
                              {isDeposit ? (
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

                            {/* Note and Timestamp */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-[#E0E1E5] truncate">
                                {trx.note}
                              </div>
                              <div className="text-[11px] text-[#949BA4] truncate">
                                {trx.walletName
                                  ? `${isDeposit ? 'From' : 'To'} ${trx.walletName} • ${formattedDate}`
                                  : formattedDate}
                              </div>
                            </div>

                            {/* Amount and Delete Action */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-sm font-bold ${
                                  isDeposit ? 'text-[#23A55A]' : 'text-[#F23F43]'
                                }`}
                              >
                                {isDeposit ? '+' : '-'} {formatIDR(trx.amount)}
                              </span>

                              {/* Delete transaction button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeletingTransaction(trx)
                                }}
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

              {/* Bottom Sheet Actions: Add Funds & Withdraw (3D Tactile, WD Oranye Terang, Tanpa Label) */}
              <div className="sticky bottom-0 bg-[#2B2D31] px-5 pt-3 pb-5 border-t border-[#1F2023]/80 flex items-center gap-3 shrink-0 select-none z-20">
                {/* Tombol Tambah Dana (+ Add Funds) - 3D Tactile Green */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMutationType('deposit')
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
                  <span className="drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]">Add Funds</span>
                </button>

                {/* Tombol Kurang Dana (- Withdraw) - 3D Tactile Bright Orange */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMutationType('withdraw')
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
                  <span className="drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]">Withdraw</span>
                </button>
              </div>
            </>
          )}

            {/* Mode: Edit Goal View */}
            {mode === 'edit' && (
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 select-none overscroll-contain">
                {/* Field 1: Goal Name (Auto Capitalize Each Word) */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-goal-name"
                    className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
                  >
                    Goal Name <span className="text-[#ED4245]">*</span>
                  </label>
                  <input
                    id="edit-goal-name"
                    type="text"
                    value={editTitle}
                    onChange={handleEditTitleChange}
                    placeholder="e.g. New Laptop, Vacation Fund"
                    className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg px-3.5 py-2.5 text-sm text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-colors"
                  />
                </div>

                {/* Field 2: Target Budget (IDR) */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-goal-budget"
                    className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
                  >
                    Target Budget (IDR) <span className="text-[#ED4245]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-sm font-bold text-[#949BA4] select-none pointer-events-none">
                      IDR
                    </span>
                    <input
                      id="edit-goal-budget"
                      type="text"
                      inputMode="numeric"
                      value={editTargetAmountString}
                      onChange={handleEditAmountChange}
                      placeholder="10,000,000"
                      className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg pl-14 pr-3.5 py-2.5 text-base font-semibold text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Field 3: Description (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-goal-desc"
                    className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
                  >
                    Description <span className="text-[10px] lowercase font-normal text-[#949BA4]/80">(optional)</span>
                  </label>
                  <textarea
                    id="edit-goal-desc"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Notes or reasons for this savings goal..."
                    rows={2}
                    className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg px-3.5 py-2.5 text-sm text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none resize-none transition-colors"
                  />
                </div>

                {/* Field 4: Icon Picker & Upload Custom Photo */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                    Goal Icon / Photo
                  </label>

                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {PRESET_ICONS.map((preset) => {
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

                    {/* Upload Custom Photo Option */}
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
                          alt="Custom Thumbnail"
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

                {/* Sticky Action Row for Edit Mode */}
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
                    disabled={!editTitle.trim() || Number(editTargetAmountString.replace(/\D/g, '')) <= 0}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[3.5px] border-[#363FA0] text-white font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(88,101,242,0.4)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[3.5px] disabled:active:scale-100 transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* 5. Option Action Picker Bottom Sheet Panel (Opened from Three Dots Menu) */}
            <AnimatePresence>
              {showActionPicker && (
                <div
                  className="fixed inset-0 z-[60] bg-black/75 flex flex-col justify-end"
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
                    {/* Top Drag Handle Panel */}
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

                    {/* Sheet Header Panel */}
                    <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-[#1F2023]/60 shrink-0 select-none">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center select-none ring-1 ring-[#1E1F22] ${
                          activeGoal.icon === 'custom' && activeGoal.customPhoto
                            ? 'border-b-[2px] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                            : percent >= 100
                            ? 'bg-gradient-to-b from-[#2ECC71] to-[#1E9550] border-b-[2px] border-[#166E3B] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_2px_6px_rgba(35,165,90,0.35)]'
                            : 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                        }`}>
                          {renderGoalIcon(activeGoal.icon, activeGoal.customPhoto, 'w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]')}
                          {activeGoal.icon === 'custom' && activeGoal.customPhoto && (
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-xl" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="discord-wordmark text-base font-bold text-[#E0E1E5] tracking-tight truncate">
                              Goal Options
                            </h3>
                            {percent >= 100 && (
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
                          <span className="text-[11px] text-[#949BA4] truncate">
                            {activeGoal.title}
                          </span>
                        </div>
                      </div>

                      {/* Tactile 3D Red Close Button */}
                      <button
                        type="button"
                        onClick={() => setShowActionPicker(false)}
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
                    <div className="p-4 flex flex-col gap-2">
                      {/* 1. Pin / Unpin Goal */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionPicker(false)
                          handleTogglePin()
                        }}
                        className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-[#1F2023]/60 transition-all text-left cursor-pointer active:scale-[0.99] group"
                      >
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            activeGoal.isPinned
                              ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2.5px] border-[#363FA0] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_4px_12px_rgba(88,101,242,0.35)]'
                              : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)]'
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                            fill={activeGoal.isPinned ? 'currentColor' : 'none'}
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
                            {activeGoal.isPinned ? 'Unpin Goal' : 'Pin Goal'}
                          </span>
                          <span className="text-xs text-[#949BA4]">
                            {activeGoal.isPinned ? 'Remove from top of list' : 'Keep goal at top of list'}
                          </span>
                        </div>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#949BA4] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>

                      {/* 2. Download Summary (PNG) */}
                      <button
                        type="button"
                        disabled={isExporting}
                        onClick={() => {
                          setShowActionPicker(false)
                          handleDownloadPNG()
                        }}
                        className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-[#1F2023]/60 transition-all text-left cursor-pointer active:scale-[0.99] group disabled:opacity-50"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] flex items-center justify-center shrink-0">
                          {isExporting ? (
                            <div className="w-4 h-4 border-2 border-[#949BA4] border-t-white rounded-full animate-spin" />
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold text-[#E0E1E5]">
                            Download Summary (PNG)
                          </span>
                          <span className="text-xs text-[#949BA4]">
                            Export visual progress card as image
                          </span>
                        </div>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#949BA4] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>

                      {/* 3. Edit Goal */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionPicker(false)
                          handleOpenEdit()
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
                            Edit Goal
                          </span>
                          <span className="text-xs text-[#949BA4]">
                            Modify goal title, target, or icon
                          </span>
                        </div>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#949BA4] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>

                      {/* 4. Move to Archive / Restore Goal */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionPicker(false)
                          handleToggleArchive()
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
                            <polyline points="21 8 21 21 3 21 3 8" />
                            <rect x="1" y="3" width="22" height="5" />
                            <line x1="10" y1="12" x2="14" y2="12" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold text-[#E0E1E5]">
                            {activeGoal.isArchived ? 'Restore to Active' : 'Move to Archive'}
                          </span>
                          <span className="text-xs text-[#949BA4]">
                            {activeGoal.isArchived
                              ? 'Return goal to active savings list'
                              : 'Archive goal and hide from active list'}
                          </span>
                        </div>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#949BA4] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>

                      {/* 5. Delete Goal */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionPicker(false)
                          setShowDeleteConfirm(true)
                        }}
                        className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#F23F43]/[0.05] hover:bg-[#F23F43]/[0.1] active:bg-[#F23F43]/[0.15] border border-[#F23F43]/20 transition-all text-left cursor-pointer active:scale-[0.99] group"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[2.5px] border-[#961D20] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(242,63,67,0.35)] flex items-center justify-center shrink-0">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold text-[#F23F43]">
                            Delete Goal
                          </span>
                          <span className="text-xs text-[#F23F43]/80">
                            Permanently remove this goal
                          </span>
                        </div>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#F23F43]/60 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>

                      {/* Cancel Button: Tactile 3D Slate */}
                      <div className="pt-2 pb-1">
                        <button
                          type="button"
                          onClick={() => setShowActionPicker(false)}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[3.5px] border-[#232428] text-[#DBDEE1] font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all text-center cursor-pointer min-h-[48px] flex items-center justify-center"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* 6. Delete Confirmation Dialog Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-sm bg-[#313338] border border-[#1F2023] rounded-2xl p-5 shadow-2xl flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5]">
                        Delete Goal?
                      </h3>
                      <p className="text-xs text-[#949BA4] leading-relaxed">
                        Are you sure you want to delete <span className="font-bold text-[#DBDEE1]">"{activeGoal.title}"</span>? All recorded transactions and progress will be permanently lost.
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
                        onClick={handleConfirmDelete}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[3.5px] border-[#961D20] text-white font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(242,63,67,0.4)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                      >
                        Delete Goal
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* 7. Transaction Record Delete Confirmation Dialog Modal */}
            <AnimatePresence>
              {deletingTransaction && (
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
                        Are you sure you want to delete this {deletingTransaction.type === 'deposit' ? 'deposit' : 'withdrawal'} record of{' '}
                        <span className="font-bold text-[#DBDEE1]">
                          {formatIDR(deletingTransaction.amount)}
                        </span>
                        {deletingTransaction.note ? ` ("${deletingTransaction.note}")` : ''}? The goal balance{deletingTransaction.walletName ? ` and "${deletingTransaction.walletName}" wallet balance` : ''} will be automatically reverted by{' '}
                        <span className="font-bold text-[#DBDEE1]">
                          {formatIDR(deletingTransaction.amount)}
                        </span>.
                      </p>
                    </div>

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
                          if (deletingTransaction) {
                            handleDeleteTransaction(deletingTransaction.id)
                            setDeletingTransaction(null)
                          }
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

      {/* Offscreen Wrapper Container (Keeps offscreen out of user viewport) */}
      {activeGoal && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '400px',
            zIndex: -100,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {/* Target Capture Card (Normal layout coordinates for SVG foreignObject) */}
          <div
            ref={exportCardRef}
            style={{
              width: '400px',
              position: 'relative',
              left: 0,
              top: 0,
              backgroundColor: '#2B2D31',
            }}
            className="bg-[#2B2D31] text-[#DBDEE1] p-6 rounded-3xl border border-[#1F2023] flex flex-col gap-4 select-none"
          >
          {/* Header Branding */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2023]/70">
            <div className="flex items-center gap-2">
              <DiscordLogo className="w-6 h-6" color="#5865F2" />
              <span className="discord-wordmark text-lg font-black text-[#E0E1E5] tracking-tight">
                Discash
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#949BA4]">
              Goal Progress
            </span>
          </div>

          {/* Goal Identity */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl shrink-0 overflow-hidden relative flex items-center justify-center select-none ring-2 ring-[#1E1F22] transition-all ${
                activeGoal.icon === 'custom' && activeGoal.customPhoto
                  ? 'border-b-[2.5px] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_3px_8px_rgba(0,0,0,0.4)]'
                  : percent >= 100
                  ? 'bg-gradient-to-b from-[#2ECC71] to-[#1E9550] border-b-[2.5px] border-[#166E3B] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_8px_rgba(35,165,90,0.35)]'
                  : 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2.5px] border-[#363FA0] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_3px_8px_rgba(88,101,242,0.35)]'
              }`}
            >
              {renderGoalIcon(activeGoal.icon, activeGoal.customPhoto, 'w-6 h-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]')}
              {activeGoal.icon === 'custom' && activeGoal.customPhoto && (
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45)] rounded-2xl" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="discord-wordmark text-xl font-black text-[#E0E1E5] tracking-tight truncate">
                  {activeGoal.title}
                </h3>
                {percent >= 100 && (
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
              {activeGoal.description && (
                <p className="text-xs text-[#949BA4] mt-0.5 line-clamp-2 leading-relaxed">
                  {activeGoal.description}
                </p>
              )}
            </div>
          </div>

          {/* Budget & Progress Overview */}
          <div className="flex flex-col gap-2.5 bg-[#1E1F22] p-4 rounded-2xl border border-[#111214]/80">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#949BA4]">
                  Collected
                </span>
                <div className="discord-wordmark text-2xl font-black text-[#23A55A] tracking-tight">
                  {formatIDR(activeGoal.currentAmount || 0)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#949BA4]">
                  Target Budget
                </span>
                <div className="text-sm font-bold text-[#DBDEE1]">
                  {formatIDR(activeGoal.targetAmount)}
                </div>
              </div>
            </div>

            {/* Progress Bar & Percentage - Tactile 3D Style */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div
                className="w-full h-3.5 rounded-full bg-[#1A1B1E] border border-[#141517] p-[1.5px] overflow-hidden"
                style={{
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.7), 0 1px 1px rgba(255, 255, 255, 0.05)',
                }}
              >
                <div
                  className={`h-full rounded-full ${
                    percent >= 100
                      ? 'bg-gradient-to-r from-[#2ECC71] via-[#23A55A] to-[#1E9550] border-b-[2px] border-[#166E3B]'
                      : 'bg-gradient-to-b from-[#7983F5] via-[#5865F2] to-[#4752C4] border-b-[2px] border-[#31378A]'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(percent > 0 ? 3 : 0, percent))}%`,
                    boxShadow:
                      percent >= 100
                        ? 'inset 0 1.5px 1px rgba(255, 255, 255, 0.55), 0 2px 8px rgba(35, 165, 90, 0.45)'
                        : 'inset 0 1.5px 1px rgba(255, 255, 255, 0.55), 0 2px 8px rgba(88, 101, 242, 0.45)',
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-[#949BA4]">
                <span>Saving Progress</span>
                <span className={`font-bold ${percent >= 100 ? 'text-[#2ECC71]' : 'text-[#E0E1E5]'}`}>{percent}%</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions Section (Up to 3 latest) */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                Recent Transactions
              </span>
              <span className="text-[10px] font-semibold text-[#949BA4]">
                Latest {(activeGoal.transactions || []).slice(0, 3).length}
              </span>
            </div>

            {(!activeGoal.transactions || activeGoal.transactions.length === 0) ? (
              <div className="py-4 text-center text-xs text-[#949BA4]">
                No transactions recorded yet.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#1F2023]/60">
                {activeGoal.transactions.slice(0, 3).map((trx) => {
                  const isDeposit = trx.type === 'deposit'
                  const formattedDate = new Date(trx.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <div
                      key={trx.id}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* 3D Tactile Icon (+ or -) */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 select-none ${
                            isDeposit
                              ? 'bg-gradient-to-b from-[#2ECC71] to-[#1E9550] text-white ring-2 ring-[#1E1F22] border-b-2 border-[#166E3B]'
                              : 'bg-gradient-to-b from-[#FF5C5C] to-[#D83A3E] text-white ring-2 ring-[#1E1F22] border-b-2 border-[#961D20]'
                          }`}
                          style={{
                            boxShadow: isDeposit
                              ? 'inset 0 1px 1.5px rgba(255, 255, 255, 0.45), 0 3px 8px rgba(35, 165, 90, 0.35)'
                              : 'inset 0 1px 1.5px rgba(255, 255, 255, 0.45), 0 3px 8px rgba(242, 63, 67, 0.35)',
                          }}
                        >
                          {isDeposit ? (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-[#DBDEE1] truncate">
                            {trx.note || (isDeposit ? 'Deposit' : 'Withdrawal')}
                          </span>
                          <span className="text-[10px] text-[#949BA4]">
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-bold text-right shrink-0 ${
                          isDeposit ? 'text-[#23A55A]' : 'text-[#F23F43]'
                        }`}
                      >
                        {isDeposit ? '+' : '-'} {formatIDR(trx.amount)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Minimal Footer */}
          <div className="pt-2 border-t border-[#1F2023]/60 flex items-center justify-between text-[10px] text-[#949BA4]">
            <span>Discash • Savings Tracker</span>
            <span>{exportDate}</span>
          </div>
        </div>
      </div>
      )}

      {/* Dedicated Mutation Sheet Modal (Add / Withdraw Funds) */}
      <GoalMutationSheet
        isOpen={isMutationOpen}
        type={activeMutationType}
        currentAmount={activeGoal.currentAmount || 0}
        wallets={wallets}
        onClose={() => setIsMutationOpen(false)}
        onConfirm={handleConfirmMutation}
        onOpenNewWallet={onOpenNewWallet}
      />
    </>
  )
}
