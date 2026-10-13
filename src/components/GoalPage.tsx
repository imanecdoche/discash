import { useState, useMemo, useRef } from 'react'
import type { Goal } from '../types/goal'
import { GoalEmptyState } from './GoalEmptyState'
import { renderGoalIcon } from './GoalIcon'
import { formatIDR } from '../utils/formatters'
import { TabHeader } from './TabHeader'
import { GoalActionPickerSheet } from './GoalActionPickerSheet'
import { GoalArchivePage } from './GoalArchivePage'

interface GoalPageProps {
  goals: Goal[]
  onSelectGoal?: (goal: Goal) => void
  onUpdateGoal?: (updatedGoal: Goal) => void
  onDeleteGoal?: (goalId: string) => void
  onEditGoal?: (goal: Goal) => void
}

type SortCriteria = 'created' | 'updated' | 'alpha' | 'progress'
type SortOrder = 'asc' | 'desc'

export function GoalPage({
  goals,
  onSelectGoal,
  onUpdateGoal,
  onDeleteGoal,
  onEditGoal,
}: GoalPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortCriteria>('created')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Sheet and Modal States
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [actionPickerGoal, setActionPickerGoal] = useState<Goal | null>(null)
  const [holdingGoalId, setHoldingGoalId] = useState<string | null>(null)

  // Long press / Tap and Hold detection refs
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPressActive = useRef(false)
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

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
    onSelectGoal?.(goal)
  }

  const handleSortClick = (criteria: SortCriteria) => {
    if (sortBy === criteria) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(criteria)
      setSortOrder(criteria === 'alpha' ? 'asc' : 'desc')
    }
  }

  const getGoalUpdatedTime = (g: Goal) => {
    if (g.updatedAt) return new Date(g.updatedAt).getTime()
    if (g.transactions && g.transactions.length > 0) {
      return new Date(g.transactions[0].createdAt).getTime()
    }
    return new Date(g.createdAt).getTime()
  }

  // Active goals exclude archived goals
  const activeGoals = useMemo(() => goals.filter((g) => !g.isArchived), [goals])

  const processedGoals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const filtered = activeGoals.filter((g) => {
      if (!q) return true
      const matchTitle = g.title.toLowerCase().includes(q)
      const matchDesc = g.description ? g.description.toLowerCase().includes(q) : false
      return matchTitle || matchDesc
    })

    return filtered.sort((a, b) => {
      // Pinned goals ALWAYS rank on top
      const isPinnedA = a.isPinned ? 1 : 0
      const isPinnedB = b.isPinned ? 1 : 0
      if (isPinnedA !== isPinnedB) {
        return isPinnedB - isPinnedA
      }

      let result = 0
      switch (sortBy) {
        case 'created': {
          const timeA = new Date(a.createdAt).getTime()
          const timeB = new Date(b.createdAt).getTime()
          result = sortOrder === 'desc' ? timeB - timeA : timeA - timeB
          break
        }
        case 'updated': {
          const timeA = getGoalUpdatedTime(a)
          const timeB = getGoalUpdatedTime(b)
          result = sortOrder === 'desc' ? timeB - timeA : timeA - timeB
          break
        }
        case 'alpha': {
          result =
            sortOrder === 'asc'
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title)
          break
        }
        case 'progress': {
          const progA = (a.currentAmount || 0) / (a.targetAmount || 1)
          const progB = (b.currentAmount || 0) / (b.targetAmount || 1)
          result = sortOrder === 'desc' ? progB - progA : progA - progB
          break
        }
      }
      return result
    })
  }, [activeGoals, searchQuery, sortBy, sortOrder])

  const handleTogglePin = (goal: Goal) => {
    const updated: Goal = {
      ...goal,
      isPinned: !goal.isPinned,
      updatedAt: new Date().toISOString(),
    }
    onUpdateGoal?.(updated)
  }

  const handleToggleArchive = (goal: Goal) => {
    const updated: Goal = {
      ...goal,
      isArchived: !goal.isArchived,
      updatedAt: new Date().toISOString(),
    }
    onUpdateGoal?.(updated)
  }

  return (
    <div className="flex flex-col gap-3 pb-4 select-none">
      {/* Header Row: TabHeader Title + Tactile 3D Archive Button on the right */}
      <div className="flex items-center justify-between shrink-0">
        <TabHeader title="Goals" />
        <button
          type="button"
          onClick={() => setIsArchiveOpen(true)}
          className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95] flex items-center justify-center transition-all cursor-pointer shrink-0"
          title="Goals Archive"
          aria-label="Goals Archive"
        >
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
        </button>
      </div>

      {activeGoals.length === 0 ? (
        <div className="flex-1 w-full min-h-[50vh] flex items-center justify-center">
          <GoalEmptyState />
        </div>
      ) : (
        <>
          {/* Global Searchbar */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#949BA4] pointer-events-none flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals by name or notes..."
              className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[#949BA4] hover:text-[#DBDEE1] p-1 cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5"
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
            )}
          </div>

          {/* Sorting Tabs / Controls - 3D Tactile Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-black text-[#949BA4] uppercase tracking-wider pl-1 pr-0.5 shrink-0 select-none">
              Sort:
            </span>

            {/* Created */}
            <button
              type="button"
              onClick={() => handleSortClick('created')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer select-none ${
                sortBy === 'created'
                  ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] ring-1 ring-[#1E1F22] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_5px_rgba(88,101,242,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]'
                  : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2px] border-[#232428] ring-1 ring-[#1E1F22] text-[#DBDEE1] hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]'
              }`}
            >
              <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">Created</span>
              {sortBy === 'created' && (
                <svg
                  viewBox="0 0 24 24"
                  className={`w-3 h-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] transition-transform ${
                    sortOrder === 'asc' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>

            {/* Updated */}
            <button
              type="button"
              onClick={() => handleSortClick('updated')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer select-none ${
                sortBy === 'updated'
                  ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] ring-1 ring-[#1E1F22] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_5px_rgba(88,101,242,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]'
                  : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2px] border-[#232428] ring-1 ring-[#1E1F22] text-[#DBDEE1] hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]'
              }`}
            >
              <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">Updated</span>
              {sortBy === 'updated' && (
                <svg
                  viewBox="0 0 24 24"
                  className={`w-3 h-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] transition-transform ${
                    sortOrder === 'asc' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>

            {/* Alphabetical */}
            <button
              type="button"
              onClick={() => handleSortClick('alpha')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer select-none ${
                sortBy === 'alpha'
                  ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] ring-1 ring-[#1E1F22] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_5px_rgba(88,101,242,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]'
                  : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2px] border-[#232428] ring-1 ring-[#1E1F22] text-[#DBDEE1] hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]'
              }`}
            >
              <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">A-Z</span>
              {sortBy === 'alpha' && (
                <svg
                  viewBox="0 0 24 24"
                  className={`w-3 h-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] transition-transform ${
                    sortOrder === 'desc' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>

            {/* Progress */}
            <button
              type="button"
              onClick={() => handleSortClick('progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer select-none ${
                sortBy === 'progress'
                  ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0] ring-1 ring-[#1E1F22] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_5px_rgba(88,101,242,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]'
                  : 'bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2px] border-[#232428] ring-1 ring-[#1E1F22] text-[#DBDEE1] hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]'
              }`}
            >
              <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">Progress</span>
              {sortBy === 'progress' && (
                <svg
                  viewBox="0 0 24 24"
                  className={`w-3 h-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] transition-transform ${
                    sortOrder === 'asc' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>
          </div>

          {/* Goal Cards List */}
          {processedGoals.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <svg
                viewBox="0 0 24 24"
                className="w-10 h-10 text-[#4E5058] mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm font-semibold text-[#949BA4]">
                No goals match "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-[#5865F2] hover:underline cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            processedGoals.map((goal) => {
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
                  className={`w-full bg-[#2B2D31] hover:bg-[#35373C] rounded-2xl border p-4 flex flex-col gap-3 select-none shadow-sm cursor-pointer transition-all duration-150 ${
                    holdingGoalId === goal.id
                      ? 'scale-[0.98] ring-2 ring-[#5865F2]/40 bg-[#35373C]'
                      : 'active:scale-[0.99]'
                  } ${
                    goal.isPinned
                      ? 'border-[#5865F2]/40 ring-1 ring-[#5865F2]/20'
                      : 'border-[#1F2023]/80'
                  }`}
                >
                  {/* Top Row: Icon + Title & Description + Pin Indicator */}
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
                        {goal.isPinned && (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3.5 h-3.5 text-[#5865F2] shrink-0 fill-current drop-shadow-[0_1px_2px_rgba(88,101,242,0.4)]"
                            aria-label="Pinned Goal"
                          >
                            <title>Pinned Goal</title>
                            <path d="M16 12V4h1V2H7v2h1v8l-2 3v2h5v5l1 1 1-1v-5h5v-2l-2-3Z" />
                          </svg>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-xs text-[#949BA4] truncate mt-0.5">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Amount & Progress */}
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
                </div>
              )
            })
          )}
        </>
      )}

      {/* Action Picker Sheet triggered by Tap and Hold */}
      <GoalActionPickerSheet
        isOpen={Boolean(actionPickerGoal)}
        goal={actionPickerGoal}
        onClose={() => setActionPickerGoal(null)}
        onTogglePin={handleTogglePin}
        onToggleArchive={handleToggleArchive}
        onEdit={(g) => {
          setActionPickerGoal(null)
          onEditGoal?.(g)
        }}
        onDelete={(id) => {
          setActionPickerGoal(null)
          onDeleteGoal?.(id)
        }}
      />

      {/* Fullscreen Goals Archive Page */}
      <GoalArchivePage
        isOpen={isArchiveOpen}
        goals={goals}
        onClose={() => setIsArchiveOpen(false)}
        onRestoreGoal={handleToggleArchive}
        onDeleteGoal={(id) => onDeleteGoal?.(id)}
        onTogglePin={handleTogglePin}
        onEditGoal={(g) => {
          setIsArchiveOpen(false)
          onEditGoal?.(g)
        }}
      />
    </div>
  )
}
