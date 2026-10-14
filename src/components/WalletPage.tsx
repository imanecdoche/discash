import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Wallet } from '../types/wallet'
import { renderGoalIcon, renderTactileOrangeStar } from './GoalIcon'
import { formatIDR } from '../utils/formatters'
import { WalletActionPickerSheet } from './WalletActionPickerSheet'

interface WalletPageProps {
  isOpen: boolean
  wallets: Wallet[]
  onClose: () => void
  onOpenNewWallet: () => void
  onSelectWallet: (wallet: Wallet, mode?: 'detail' | 'edit') => void
  onUpdateWallet: (wallet: Wallet) => void
  onToggleMainWallet?: (wallet: Wallet) => void
  onDeleteWallet: (walletId: string) => void
}

export function WalletPage({
  isOpen,
  wallets,
  onClose,
  onOpenNewWallet,
  onSelectWallet,
  onUpdateWallet,
  onToggleMainWallet,
  onDeleteWallet,
}: WalletPageProps) {
  const [actionPickerWallet, setActionPickerWallet] = useState<Wallet | null>(null)
  const [holdingWalletId, setHoldingWalletId] = useState<string | null>(null)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPressActive = useRef(false)
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const totalUnallocated = useMemo(
    () => wallets.reduce((acc, w) => acc + (w.balance || 0), 0),
    [wallets]
  )

  const sortedWallets = useMemo(() => {
    return [...wallets].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1
      if (!a.isMain && b.isMain) return 1
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [wallets])

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setHoldingWalletId(null)
  }

  const handleTouchStart = (wallet: Wallet, e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    isLongPressActive.current = false
    setHoldingWalletId(wallet.id)

    clearLongPress()
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true
      setHoldingWalletId(null)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50)
        } catch {
          // ignore
        }
      }
      setActionPickerWallet(wallet)
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

  const handleMouseDown = (wallet: Wallet, e: React.MouseEvent) => {
    touchStartPos.current = { x: e.clientX, y: e.clientY }
    isLongPressActive.current = false
    setHoldingWalletId(wallet.id)

    clearLongPress()
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true
      setHoldingWalletId(null)
      setActionPickerWallet(wallet)
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

  const handleCardClick = (wallet: Wallet) => {
    if (isLongPressActive.current) {
      isLongPressActive.current = false
      return
    }
    onSelectWallet(wallet, 'detail')
  }

  const handleTogglePin = (wallet: Wallet) => {
    onUpdateWallet({
      ...wallet,
      isPinned: !wallet.isPinned,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="wallets-fullscreen-page"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed inset-0 z-[60] bg-[#313338] flex flex-col overflow-hidden select-none transform-gpu will-change-transform"
          >
            {/* Header: Tactile 3D Back Button + Title + Add Wallet Button */}
            <div className="px-4 pt-3 pb-3 border-b border-[#1F2023]/80 bg-[#2B2D31]/95 flex items-center justify-between shrink-0 select-none shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95] flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Back to Dashboard"
                  aria-label="Back to Dashboard"
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

                <h1
                  className="discord-wordmark text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E8EAED] to-[#B5BAC1] tracking-tight leading-tight select-none truncate"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))',
                  }}
                >
                  Wallets
                </h1>
              </div>

              {/* Tactile 3D Add Wallet Button */}
              <button
                type="button"
                onClick={onOpenNewWallet}
                className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2.5px] border-[#363FA0] ring-2 ring-[#1E1F22] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_3px_10px_rgba(88,101,242,0.4)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95] flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Add New Wallet"
                aria-label="Add New Wallet"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3.5 overscroll-contain max-w-[430px] w-full mx-auto">
              {/* Total Unallocated Assets Summary Card (Tactile 3D) */}
              <section
                aria-label="Total Unallocated Wallet Assets"
                className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#35383E] via-[#2B2D31] to-[#212327] border-t border-x border-[#40434A]/70 border-b-[4.5px] border-[#16171A] ring-2 ring-[#17181B] p-5 select-none transform-gpu shrink-0"
                style={{
                  boxShadow:
                    'inset 0 1.5px 2px rgba(255, 255, 255, 0.18), 0 10px 28px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(88, 101, 242, 0.18)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#949BA4]">
                      Total Unallocated Assets
                    </span>
                    <span className="discord-wordmark text-2xl sm:text-3xl font-black tracking-[-0.03em] text-[#E0E1E5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {formatIDR(totalUnallocated)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#949BA4] shrink-0 pt-0.5">
                    {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
                  </span>
                </div>
              </section>

              {/* Wallet List or Empty State */}
              {sortedWallets.length === 0 ? (
                <div className="flex-1 min-h-[48vh] flex flex-col items-center justify-center text-center p-6">
                  {/* Naked empty state icon without box and without purple per rules */}
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
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                  </svg>
                  <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5] mb-1">
                    No Wallets Yet
                  </h3>
                  <p className="text-xs text-[#949BA4] max-w-xs leading-relaxed">
                    Tap the + button in the top right to add your first asset wallet and allocate funds to your savings goals.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-4">
                  {sortedWallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      onClick={() => handleCardClick(wallet)}
                      onTouchStart={(e) => handleTouchStart(wallet, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={(e) => handleMouseDown(wallet, e)}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onContextMenu={(e) => e.preventDefault()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCardClick(wallet)
                        }
                      }}
                      className={`relative w-full bg-[#2B2D31] hover:bg-[#35373C] rounded-2xl border p-4 flex items-center justify-between gap-3 select-none shadow-sm cursor-pointer transition-all duration-150 ${
                        holdingWalletId === wallet.id
                          ? 'scale-[0.98] ring-2 ring-[#5865F2]/40 bg-[#35373C]'
                          : 'active:scale-[0.99]'
                      } ${
                        wallet.isPinned
                          ? 'border-[#5865F2]/40 ring-1 ring-[#5865F2]/20'
                          : 'border-[#1F2023]/80'
                      }`}
                    >
                      {/* Tactile 3D Pin Indicator Right on Top-Right Card Corner Vertex */}
                      {wallet.isPinned && (
                        <div
                          className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-lg bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[1.5px] border-[#363FA0] ring-2 ring-[#313338] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_5px_rgba(88,101,242,0.5)] flex items-center justify-center shrink-0 select-none pointer-events-none"
                          aria-label="Pinned Wallet"
                          title="Pinned Wallet"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-2.5 h-2.5 fill-current drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                          >
                            <path d="M16 12V4h1V2H7v2h1v8l-2 3v2h5v5l1 1 1-1v-5h5v-2l-2-3Z" />
                          </svg>
                        </div>
                      )}

                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Tactile 3D Wallet Icon Container */}
                        <div
                          className={`w-11 h-11 rounded-2xl shrink-0 overflow-hidden relative flex items-center justify-center select-none ring-2 ring-[#1E1F22] transition-all ${
                            wallet.icon === 'custom' && wallet.customPhoto
                              ? 'border-b-[2.5px] border-[#1C1D20] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_3px_8px_rgba(0,0,0,0.4)]'
                              : 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2.5px] border-[#363FA0] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_3px_8px_rgba(88,101,242,0.35)]'
                          }`}
                        >
                          {renderGoalIcon(
                            wallet.icon,
                            wallet.customPhoto,
                            'w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]'
                          )}
                          {wallet.icon === 'custom' && wallet.customPhoto && (
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45)] rounded-2xl" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="discord-wordmark text-base font-bold leading-none text-[#E0E1E5] truncate">
                              {wallet.name}
                            </h3>
                            {wallet.isMain && renderTactileOrangeStar('w-4 h-4')}
                          </div>
                          <p className="text-xs text-[#949BA4] truncate mt-0.5">
                            {wallet.description || 'Available asset wallet'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="discord-wordmark text-base font-black text-[#E0E1E5]">
                          {formatIDR(wallet.balance || 0)}
                        </div>
                        <span className="text-[11px] text-[#949BA4]">
                          Available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WalletActionPickerSheet
        isOpen={Boolean(actionPickerWallet)}
        wallet={actionPickerWallet}
        onClose={() => setActionPickerWallet(null)}
        onToggleMain={(w) => onToggleMainWallet?.(w)}
        onTogglePin={handleTogglePin}
        onEdit={(w) => {
          setActionPickerWallet(null)
          onSelectWallet(w, 'edit')
        }}
        onDelete={(id) => {
          onDeleteWallet(id)
          setActionPickerWallet(null)
        }}
      />
    </>
  )
}
