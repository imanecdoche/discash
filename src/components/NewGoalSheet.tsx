import { useState, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { toTitleCase, formatNumberInput } from '../utils/formatters'
import { PRESET_ICONS, renderGoalIcon } from './GoalIcon'
import type { Goal } from '../types/goal'

interface NewGoalSheetProps {
  isOpen: boolean
  onClose: () => void
  onSaveGoal: (goal: Goal) => void
}

export function NewGoalSheet({ isOpen, onClose, onSaveGoal }: NewGoalSheetProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmountString, setTargetAmountString] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('goal')
  const [customPhoto, setCustomPhoto] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)

  const resetForm = () => {
    setIsDragging(false)
    setTitle('')
    setDescription('')
    setTargetAmountString('')
    setSelectedIcon('goal')
    setCustomPhoto(null)
  }

  const handleDismiss = () => {
    resetForm()
    onClose()
  }

  // Automatic title case formatting as user types
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = toTitleCase(e.target.value)
    setTitle(formatted)
  }

  // Format currency with thousand separators
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberInput(e.target.value)
    setTargetAmountString(formatted)
  }

  // Handle custom photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setCustomPhoto(result)
      setSelectedIcon('custom')
    }
    reader.readAsDataURL(file)
  }

  const rawAmount = Number(targetAmountString.replace(/\D/g, ''))

  const handleSave = () => {
    if (!title.trim() || rawAmount <= 0) return

    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      description: description.trim() || undefined,
      targetAmount: rawAmount,
      currentAmount: 0,
      icon: selectedIcon,
      customPhoto: customPhoto || undefined,
      createdAt: new Date().toISOString(),
    }

    onSaveGoal(newGoal)
    resetForm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="new-goal-backdrop"
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
          key="new-goal-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            duration: 0.35,
            ease: [0.32, 0.72, 0, 1], // Kurva fisik halus tanpa fading
          }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.05, bottom: 0.75 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_e, info) => {
            setIsDragging(false)
            // Menutup sheet jika di-drag ke bawah melebihi threshold
            if (info.offset.y > 100 || info.velocity.y > 400) {
              handleDismiss()
            }
          }}
          className="fixed inset-x-0 bottom-0 mx-auto z-50 w-full max-w-[430px] h-[92dvh] max-h-[820px] bg-[#2B2D31] rounded-t-3xl border-t border-[#1F2023]/90 shadow-2xl flex flex-col overflow-hidden pointer-events-auto transform-gpu will-change-transform"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-goal-sheet-title"
        >
            {/* Top Drag Handle Panel (Tarik ke bawah untuk menutup) */}
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
                if ((e.target as HTMLElement).tagName !== 'BUTTON' && !(e.target as HTMLElement).closest('button')) {
                  setIsDragging(true)
                  dragControls.start(e)
                }
              }}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
              className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-[#1F2023]/60 shrink-0 select-none cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center shrink-0 overflow-hidden">
                  {renderGoalIcon(selectedIcon, customPhoto || undefined, 'w-4 h-4')}
                </div>
                <h2
                  id="new-goal-sheet-title"
                  className="discord-wordmark text-lg font-bold text-[#E0E1E5] tracking-tight"
                >
                  Create New Goal
                </h2>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 text-[#949BA4] hover:text-[#E0E1E5] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close sheet"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable Form Content (Direct on surface, NO nested box) */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {/* Field 1: Goal Name (Auto Capitalize Each Word) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="goal-name-input"
                  className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
                >
                  Goal Name <span className="text-[#ED4245]">*</span>
                </label>
                <input
                  id="goal-name-input"
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. New Gaming Laptop, Japan Trip"
                  className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg px-3.5 py-2.5 text-base text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-colors"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {/* Field 2: Target Budget (IDR Currency Input) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="goal-budget-input"
                  className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
                >
                  Target Budget <span className="text-[#ED4245]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-bold text-[#5865F2] select-none pointer-events-none">
                    IDR
                  </span>
                  <input
                    id="goal-budget-input"
                    type="text"
                    inputMode="numeric"
                    value={targetAmountString}
                    onChange={handleAmountChange}
                    placeholder="10,000,000"
                    className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg pl-14 pr-3.5 py-2.5 text-base font-semibold text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Field 3: Description (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="goal-description-input"
                  className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]"
                >
                  Description <span className="text-[10px] lowercase font-normal text-[#949BA4]/80">(optional)</span>
                </label>
                <textarea
                  id="goal-description-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes or reasons for this savings goal..."
                  rows={2}
                  className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-lg px-3.5 py-2.5 text-sm text-[#DBDEE1] placeholder-[#4E5058] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none resize-none transition-colors"
                />
              </div>

              {/* Field 4: Icon Picker & Upload Custom Photo (Default: Goal Target) */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                  Goal Icon / Photo
                </label>

                {/* Preset Icons Grid & Upload Trigger */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {PRESET_ICONS.map((preset) => {
                    const isSelected = selectedIcon === preset.id && !customPhoto
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(preset.id)
                          setCustomPhoto(null)
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
                      selectedIcon === 'custom' && customPhoto
                        ? 'ring-2 ring-[#5865F2] bg-[#1E1F22]'
                        : 'bg-[#1E1F22] text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#232428]'
                    }`}
                    title="Upload Custom Photo"
                  >
                    {customPhoto ? (
                      <img
                        src={customPhoto}
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
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Action Row at Bottom: Tombol Batal & Simpan dalam Satu Row */}
            <div className="sticky bottom-0 bg-[#2B2D31] px-5 py-3 pb-8 border-t border-[#1F2023]/80 flex items-center gap-3 shrink-0 mt-auto select-none">
              {/* Tombol Batal */}
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[3.5px] border-[#232428] text-[#DBDEE1] font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Cancel
              </button>

              {/* Tombol Simpan */}
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || rawAmount <= 0}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[3.5px] border-[#363FA0] text-white font-bold text-sm ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(88,101,242,0.4)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[3.5px] disabled:active:scale-100 transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Save Goal
              </button>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  )
}
