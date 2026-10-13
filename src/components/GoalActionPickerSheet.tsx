import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
import type { Goal } from '../types/goal'
import { renderGoalIcon } from './GoalIcon'
import { DiscordLogo } from './DiscordLogo'
import { formatIDR } from '../utils/formatters'

export interface GoalActionPickerSheetProps {
  isOpen: boolean
  goal: Goal | null
  onClose: () => void
  onTogglePin?: (goal: Goal) => void
  onToggleArchive?: (goal: Goal) => void
  onEdit?: (goal: Goal) => void
  onDelete?: (goalId: string) => void
}

export function GoalActionPickerSheet({
  isOpen,
  goal,
  onClose,
  onTogglePin,
  onToggleArchive,
  onEdit,
  onDelete,
}: GoalActionPickerSheetProps) {
  const [isPickerDragging, setIsPickerDragging] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const exportCardRef = useRef<HTMLDivElement | null>(null)

  const [formattedCurrentDate] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  )

  if (!goal) return null

  const percent = Math.round(
    ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100
  )

  const handleDownloadPNG = async () => {
    if (!exportCardRef.current || !goal || isExporting) return
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

      const sanitizedTitle =
        goal.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'goal'

      const link = document.createElement('a')
      link.download = `progress-${sanitizedTitle}.png`
      link.href = dataUrl
      link.click()
      onClose()
    } catch (err) {
      console.error('Failed to export goal progress PNG:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleConfirmDelete = () => {
    if (!goal) return
    onDelete?.(goal.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - Clean dark surface strictly without blur */}
            <motion.div
              key="action-picker-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/75 z-[60] cursor-pointer"
              aria-hidden="true"
            />

            {/* Bottom Sheet Panel Container */}
            <div className="fixed inset-0 z-[61] pointer-events-none flex justify-center items-end select-none">
              <motion.div
                key="action-picker-panel"
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
                    <div
                      className={`w-9 h-9 rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center select-none ring-1 ring-[#1E1F22] ${
                        goal.icon === 'custom' && goal.customPhoto
                          ? 'border-b-[2px] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                          : percent >= 100
                          ? 'bg-gradient-to-b from-[#2ECC71] to-[#1E9550] border-b-[2px] border-[#166E3B] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_2px_6px_rgba(35,165,90,0.35)]'
                          : 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.3)]'
                      }`}
                    >
                      {renderGoalIcon(
                        goal.icon,
                        goal.customPhoto,
                        'w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]'
                      )}
                      {goal.icon === 'custom' && goal.customPhoto && (
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-xl" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="discord-wordmark text-base font-bold text-[#E0E1E5] tracking-tight truncate">
                          Goal Options
                        </h3>
                        {percent >= 100 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-b from-[#2ECC71] to-[#1E9550] border-b-[2px] border-[#166E3B] text-white ring-1 ring-[#146034] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_6px_rgba(35,165,90,0.35)] shrink-0 select-none">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-2.5 h-2.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                              fill="none"
                              stroke="white"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                              ACHIEVED
                            </span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#949BA4] truncate">
                        {goal.title}
                      </span>
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
                  {/* 1. Pin / Unpin Goal */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onTogglePin?.(goal)
                    }}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-[#1F2023]/60 transition-all text-left cursor-pointer active:scale-[0.99] group"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        goal.isPinned
                          ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2.5px] border-[#363FA0] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_4px_12px_rgba(88,101,242,0.35)]'
                          : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)]'
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                        fill={goal.isPinned ? 'currentColor' : 'none'}
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
                        {goal.isPinned ? 'Unpin Goal' : 'Pin Goal'}
                      </span>
                      <span className="text-xs text-[#949BA4]">
                        {goal.isPinned
                          ? 'Remove from top of list'
                          : 'Keep goal at top of list'}
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

                  {/* 2. Download Summary (PNG) */}
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleDownloadPNG}
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

                  {/* 3. Edit Goal */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onEdit?.(goal)
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

                  {/* 4. Move to Archive / Restore Goal */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onToggleArchive?.(goal)
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
                        {goal.isArchived ? 'Restore to Active' : 'Move to Archive'}
                      </span>
                      <span className="text-xs text-[#949BA4]">
                        {goal.isArchived
                          ? 'Return goal to active savings list'
                          : 'Archive goal and hide from active list'}
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

                  {/* 5. Delete Goal */}
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
                        Delete Goal
                      </span>
                      <span className="text-xs text-[#949BA4]">
                        Permanently remove this goal and history
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

      {/* Delete Goal Confirmation Modal Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
              className="relative w-full max-w-sm bg-[#313338] border border-[#1F2023] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 z-10"
            >
              <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5]">
                Delete Goal?
              </h3>
              <p className="text-sm text-[#949BA4] leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-[#E0E1E5] font-semibold">
                  "{goal.title}"
                </strong>
                ? All tracked transactions and savings progress will be permanently removed. This action cannot be undone.
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
                  Delete Goal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Card Offscreen for PNG Generation */}
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
                goal.icon === 'custom' && goal.customPhoto
                  ? 'border-b-[2.5px] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_3px_8px_rgba(0,0,0,0.4)]'
                  : percent >= 100
                  ? 'bg-gradient-to-b from-[#2ECC71] to-[#1E9550] border-b-[2.5px] border-[#166E3B] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_8px_rgba(35,165,90,0.35)]'
                  : 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2.5px] border-[#363FA0] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_3px_8px_rgba(88,101,242,0.35)]'
              }`}
            >
              {renderGoalIcon(
                goal.icon,
                goal.customPhoto,
                'w-6 h-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]'
              )}
              {goal.icon === 'custom' && goal.customPhoto && (
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45)] rounded-2xl" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="discord-wordmark text-xl font-black text-[#E0E1E5] tracking-tight truncate">
                  {goal.title}
                </h3>
                {percent >= 100 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-b from-[#2ECC71] to-[#1E9550] border-b-[2px] border-[#166E3B] text-white ring-1 ring-[#146034] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_6px_rgba(35,165,90,0.35)] shrink-0 select-none">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-2.5 h-2.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                      fill="none"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                      ACHIEVED
                    </span>
                  </span>
                )}
              </div>
              {goal.description && (
                <p className="text-xs text-[#949BA4] mt-0.5 line-clamp-2 leading-relaxed">
                  {goal.description}
                </p>
              )}
            </div>
          </div>

          {/* Progress Metrics & Bar */}
          <div className="bg-[#1E1F22] rounded-2xl p-4 border border-[#17181B] flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#949BA4] tracking-wider block">
                  Saved Amount
                </span>
                <span className="discord-wordmark text-xl font-black text-[#2ECC71]">
                  {formatIDR(goal.currentAmount || 0)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#949BA4] tracking-wider block">
                  Target
                </span>
                <span className="text-xs font-bold text-[#DBDEE1]">
                  {formatIDR(goal.targetAmount)}
                </span>
              </div>
            </div>

            {/* Tactile 3D Progress Bar */}
            <div
              className="w-full h-3 rounded-full bg-[#111214] border border-[#141517] p-[1.5px] overflow-hidden"
              style={{
                boxShadow:
                  'inset 0 1.5px 3px rgba(0, 0, 0, 0.8), 0 1px 1px rgba(255, 255, 255, 0.05)',
              }}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  percent >= 100
                    ? 'bg-gradient-to-r from-[#2ECC71] via-[#23A55A] to-[#1E9550] border-b-[1.5px] border-[#166E3B]'
                    : 'bg-gradient-to-b from-[#7983F5] via-[#5865F2] to-[#4752C4] border-b-[1.5px] border-[#31378A]'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(percent > 0 ? 3 : 0, percent))}%`,
                  boxShadow:
                    percent >= 100
                      ? 'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 2px 6px rgba(35, 165, 90, 0.4)'
                      : 'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 2px 6px rgba(88, 101, 242, 0.4)',
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-[#949BA4]">
              <span>Progress</span>
              <span className={percent >= 100 ? 'text-[#2ECC71] font-bold' : ''}>
                {percent}%
              </span>
            </div>
          </div>

          {/* Footer Timestamp */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-[#949BA4]/80">
            <span>Generated via Discash Mobile</span>
            <span>{formattedCurrentDate}</span>
          </div>
        </div>
      </div>
    </>
  )
}
