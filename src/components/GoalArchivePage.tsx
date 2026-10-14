import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Goal } from '../types/goal'
import { renderGoalIcon } from './GoalIcon'
import { formatIDR } from '../utils/formatters'
import { GoalActionPickerSheet } from './GoalActionPickerSheet'

interface GoalArchivePageProps {
  isOpen: boolean
  goals: Goal[]
  onClose: () => void
  onRestoreGoal: (goal: Goal) => void
  onDeleteGoal: (goalId: string) => void
  onTogglePin?: (goal: Goal) => void
  onEditGoal?: (goal: Goal) => void
}

export function GoalArchivePage({
  isOpen,
  goals,
  onClose,
  onRestoreGoal,
  onDeleteGoal,
  onTogglePin,
  onEditGoal,
}: GoalArchivePageProps) {
  const [actionPickerGoal, setActionPickerGoal] = useState<Goal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)
  const [holdingGoalId, setHoldingGoalId] = useState<string | null>(null)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPressActive = useRef(false)
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const archivedGoals = goals.filter((g) => g.isArchived)

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setHoldingGoalId(null)
  }

  const handleTouchStart = (goal: Goal, e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    isLongPressActive.current = false
    setHoldingGoalId(goal.id)

    clearLongPress()
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true
      setHoldingGoalId(null)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50)
        } catch {
          // ignore
        }
      }
      setActionPickerGoal(goal)
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - touchStartPos.current.x)
    const deltaY = Math.abs(e.touches[0].clientY - touchStartPos.current.y)
    if (deltaX > 10 || deltaY > 10) {
      clearLongPress()
    }
  }

  const handleTouchEnd = () => {
    clearLongPress()
  }

  const handleMouseDown = (goal: Goal, e: React.MouseEvent) => {
    touchStartPos.current = { x: e.clientX, y: e.clientY }
    isLongPressActive.current = false
    setHoldingGoalId(goal.id)

    clearLongPress()
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true
      setHoldingGoalId(null)
      setActionPickerGoal(goal)
    }, 500)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = Math.abs(e.clientX - touchStartPos.current.x)
    const deltaY = Math.abs(e.clientY - touchStartPos.current.y)
    if (deltaX > 10 || deltaY > 10) {
      clearLongPress()
    }
  }

  const handleMouseUp = () => {
    clearLongPress()
  }

  const handleCardClick = (goal: Goal) => {
    if (isLongPressActive.current) {
      isLongPressActive.current = false
      return
    }
    // Normal tap in archive opens Action Picker so user can choose action
    setActionPickerGoal(goal)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="goals-archive-fullscreen"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed inset-0 z-[60] bg-[#313338] flex flex-col overflow-hidden select-none"
          >
            {/* Header: Tactile 3D Back Button + Header Title */}
            <div className="px-4 pt-3 pb-3 border-b border-[#1F2023]/80 bg-[#2B2D31]/95 flex items-center justify-between shrink-0 select-none shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                {/* 3D Tactile Back Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95] flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Back to Goals"
                  aria-label="Back to Goals"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                {/* Header Title with 3D Tactile Gradient Style */}
                <h1
                  className="discord-wordmark text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E8EAED] to-[#B5BAC1] tracking-tight leading-tight select-none truncate"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))',
                  }}
                >
                  Archived Goals
                </h1>
              </div>

              {/* Counter Indicator */}
              <span className="text-xs font-semibold text-[#949BA4] shrink-0">
                {archivedGoals.length} {archivedGoals.length === 1 ? 'goal' : 'goals'}
              </span>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3 overscroll-contain">
              {archivedGoals.length === 0 ? (
                <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                  {/* Clean naked archive icon without background box per rules */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-16 h-16 text-[#4E5058] mb-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="21 8 21 21 3 21 3 8" />
                    <rect x="1" y="3" width="22" height="5" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                  <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5] mb-1">
                    No Archived Goals
                  </h3>
                  <p className="text-xs text-[#949BA4] max-w-xs leading-relaxed">
                    Goals you move to archive will safely appear here. You can restore them back to your active list at any time.
                  </p>
                </div>
              ) : (
                archivedGoals.map((goal) => {
                  const percent = Math.round(
                    ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100
                  )

                  return (
                    <div
                      key={goal.id}
                      onClick={() => handleCardClick(goal)}
                      onTouchStart={(e) => handleTouchStart(goal, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={(e) => handleMouseDown(goal, e)}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onContextMenu={(e) => e.preventDefault()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCardClick(goal)
                        }
                      }}
                      className={`relative w-full bg-[#2B2D31] hover:bg-[#35373C] rounded-2xl border p-4 flex flex-col gap-3 select-none shadow-sm cursor-pointer transition-all duration-150 ${
                        holdingGoalId === goal.id
                          ? 'scale-[0.98] ring-2 ring-[#5865F2]/40 bg-[#35373C]'
                          : 'active:scale-[0.99]'
                      } ${
                        goal.isPinned
                          ? 'border-[#5865F2]/40 ring-1 ring-[#5865F2]/20'
                          : 'border-[#1F2023]/80'
                      }`}
                    >
                      {/* Tactile 3D Pin Indicator Right on Top-Right Card Corner Vertex */}
                      {goal.isPinned && (
                        <div
                          className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-lg bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[1.5px] border-[#363FA0] ring-2 ring-[#313338] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_5px_rgba(88,101,242,0.5)] flex items-center justify-center shrink-0 select-none pointer-events-none"
                          aria-label="Pinned Goal"
                          title="Pinned Goal"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-2.5 h-2.5 fill-current drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                          >
                            <path d="M16 12V4h1V2H7v2h1v8l-2 3v2h5v5l1 1 1-1v-5h5v-2l-2-3Z" />
                          </svg>
                        </div>
                      )}

                      {/* Top Row: Icon + Title & Description */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl shrink-0 overflow-hidden relative flex items-center justify-center select-none ring-2 ring-[#1E1F22] transition-all ${
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
                            'w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]'
                          )}
                          {goal.icon === 'custom' && goal.customPhoto && (
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45)] rounded-2xl" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="discord-wordmark text-base font-bold text-[#E0E1E5] truncate">
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
                            <p className="text-xs text-[#949BA4] truncate mt-0.5">
                              {goal.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress Metrics & Bar */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#949BA4]">
                            {formatIDR(goal.currentAmount || 0)}
                          </span>
                          <span className="font-bold text-[#DBDEE1]">
                            {formatIDR(goal.targetAmount)}
                          </span>
                        </div>

                        {/* Progress bar - Tactile 3D Style */}
                        <div
                          className="w-full h-3 rounded-full bg-[#1A1B1E] border border-[#141517] p-[1px] overflow-hidden"
                          style={{
                            boxShadow:
                              'inset 0 1.5px 3px rgba(0, 0, 0, 0.7), 0 1px 1px rgba(255, 255, 255, 0.05)',
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

                        <div className="flex justify-end">
                          <span
                            className={`text-[11px] font-semibold ${
                              percent >= 100 ? 'text-[#2ECC71]' : 'text-[#949BA4]'
                            }`}
                          >
                            {percent}%
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons: Restore & Delete */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#1F2023]/60">
                        {/* Restore Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRestoreGoal(goal)
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] ring-1 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_2px_6px_rgba(88,101,242,0.3)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98] flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3.5 h-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="21 8 21 21 3 21 3 8" />
                            <rect x="1" y="3" width="22" height="5" />
                            <polyline points="10 12 12 10 14 12" />
                            <line x1="12" y1="10" x2="12" y2="16" />
                          </svg>
                          <span>Restore</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setGoalToDelete(goal)
                          }}
                          className="py-2 px-3 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2px] border-[#232428] ring-1 ring-[#1E1F22] text-[#FF5C5C] hover:text-white hover:bg-gradient-to-b hover:from-[#FF5C5C] hover:to-[#DA373C] hover:border-[#961D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_2px_6px_rgba(0,0,0,0.3)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98] flex items-center justify-center transition-all cursor-pointer"
                          title="Delete Goal"
                          aria-label="Delete Goal"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3.5 h-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Picker Sheet when invoked from archive */}
      <GoalActionPickerSheet
        isOpen={Boolean(actionPickerGoal)}
        goal={actionPickerGoal}
        onClose={() => setActionPickerGoal(null)}
        onTogglePin={(g) => onTogglePin?.(g)}
        onToggleArchive={(g) => {
          onRestoreGoal(g)
          setActionPickerGoal(null)
        }}
        onEdit={(g) => {
          setActionPickerGoal(null)
          onEditGoal?.(g)
        }}
        onDelete={(id) => {
          onDeleteGoal(id)
          setActionPickerGoal(null)
        }}
      />

      {/* Delete Confirmation Modal in Archive */}
      <AnimatePresence>
        {goalToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80"
              onClick={() => setGoalToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#313338] border border-[#1F2023] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 z-10 select-none"
            >
              <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5]">
                Delete Archived Goal?
              </h3>
              <p className="text-sm text-[#949BA4] leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-[#E0E1E5] font-semibold">
                  "{goalToDelete.title}"
                </strong>
                ? This will permanently remove all tracked transactions and savings history. This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setGoalToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-1 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_2px_6px_rgba(0,0,0,0.3)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98] text-sm font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteGoal(goalToDelete.id)
                    setGoalToDelete(null)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[2.5px] border-[#961D20] ring-1 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_8px_rgba(218,55,60,0.4)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98] text-sm font-bold transition-all cursor-pointer"
                >
                  Delete Goal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
