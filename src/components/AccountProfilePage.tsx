import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TabHeader } from './TabHeader'

function SwitchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function LogoutIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

const LINKED_SOCIAL_MEDIA = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@zerotwenty',
    iconSrc: '/icons/social/instagram.png',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    handle: '@zerotwenty',
    iconSrc: '/icons/social/twitter.png',
  },
  {
    id: 'steam',
    name: 'Steam',
    handle: 'zerotwenty',
    iconSrc: '/icons/social/steam.png',
  },
  {
    id: 'x',
    name: 'X',
    handle: '@zerotwenty',
    iconSrc: '/icons/social/x.png',
  },
  {
    id: 'line',
    name: 'LINE',
    handle: 'fatih_farhat',
    iconSrc: '/icons/social/line.png',
  },
]

interface AccountProfilePageProps {
  className?: string
  onPurgeAccount?: () => void
  onLogout?: () => void
  onSwitchAccount?: () => void
}

export function AccountProfilePage({
  className = '',
  onPurgeAccount,
  onLogout,
  onSwitchAccount,
}: AccountProfilePageProps) {
  const [confirmModal, setConfirmModal] = useState<'purge' | 'switch' | 'logout' | null>(null)
  const [purgeFeedback, setPurgeFeedback] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isCanvasReady, setIsCanvasReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sheet = new Image()
    sheet.src = '/decoration-spritesheet.webp'

    let animationFrameId: number
    let isRunning = true
    let frameIndex = 0
    let isPaused = false
    let lastFrameTime = performance.now()
    const totalFrames = 60
    const frameInterval = 1000 / 12 // Exactly 12 FPS (~83.33ms per frame, 60 frames = 5.0 seconds)
    const pauseDuration = 3000 // 3 seconds pause at Frame 0 (the exact static pose)

    const drawFrame = (index: number) => {
      const col = index % 10
      const row = Math.floor(index / 10)
      const sx = col * 288
      const sy = row * 288
      ctx.clearRect(0, 0, 288, 288)
      ctx.drawImage(sheet, sx, sy, 288, 288, 0, 0, 288, 288)
    }

    sheet.onload = () => {
      // Draw initial Frame 0 (100% bit-exact match with static image)
      drawFrame(0)
      setIsCanvasReady(true)

      const tick = (now: number) => {
        if (!isRunning) return

        if (isPaused) {
          // Paused on Frame 0 (the static frame) for 3 seconds
          if (now - lastFrameTime >= pauseDuration) {
            isPaused = false
            lastFrameTime = now
            frameIndex = 1
            drawFrame(1)
          }
        } else {
          const elapsed = now - lastFrameTime
          if (elapsed >= frameInterval) {
            lastFrameTime = now - (elapsed % frameInterval)
            frameIndex++

            if (frameIndex >= totalFrames) {
              // Smoothly completed full 60-frame loop (5.0s)
              // The next frame in the loop naturally lands on Frame 0 (the static pose)
              frameIndex = 0
              drawFrame(0)
              isPaused = true
              lastFrameTime = now
            } else {
              drawFrame(frameIndex)
            }
          }
        }

        animationFrameId = requestAnimationFrame(tick)
      }

      animationFrameId = requestAnimationFrame(tick)
    }

    return () => {
      isRunning = false
      cancelAnimationFrame(animationFrameId)
    }
  }, [])
  return (
    <div className={`w-full flex flex-col gap-3 pb-6 select-none ${className}`}>
      <TabHeader title="Account Profile" />

      {/* Discord Profile Card Shell */}
      <div className="overflow-hidden rounded-2xl bg-[#2B2D31] border border-[#1F2023]/80 shadow-xl">
        {/* Profile Banner */}
        <div className="relative h-32 sm:h-36 w-full bg-[#111214] overflow-hidden">
          <img
            src="/banner.gif"
            alt="Profile Banner"
            className="w-full h-full object-cover object-center pointer-events-none"
          />
        </div>

        {/* Profile Header Content (Overlapping Avatar & Names) */}
        <div className="relative px-4 pb-4">
          {/* Wumpus Avatar with Discord Native SVG Status */}
          <div className="relative -mt-12 sm:-mt-14 mb-3 inline-block">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-[6px] ring-[#2B2D31] bg-[#2B2D31] shadow-xl">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 80 80"
                className="mask__44b0c svg__44b0c drop-shadow-md overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <mask
                    id="svg-mask-avatar-status-round-80"
                    maskContentUnits="objectBoundingBox"
                    viewBox="0 0 1 1"
                  >
                    <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
                    <circle fill="black" cx="0.85" cy="0.85" r="0.175" />
                  </mask>
                  <mask
                    id="svg-mask-status-idle"
                    maskContentUnits="objectBoundingBox"
                    viewBox="0 0 1 1"
                  >
                    <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
                    <circle fill="black" cx="0.25" cy="0.25" r="0.375" />
                  </mask>
                </defs>
                <foreignObject
                  x="0"
                  y="0"
                  width="80"
                  height="80"
                  mask="url(#svg-mask-avatar-status-round-80)"
                >
                  <div className="avatarStack__44b0c w-full h-full bg-[#1E1F22] rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src="/avatar.png"
                      alt="Fatih Farhat Avatar"
                      className="avatar__44b0c w-full h-full object-cover pointer-events-none"
                      style={{
                        transform: 'scale(1.1)',
                        transformOrigin: '53% 46%',
                      }}
                    />
                  </div>
                </foreignObject>
                <g>
                  <rect
                    width="16"
                    height="16"
                    x="60"
                    y="60"
                    fill="#ffc04e"
                    mask="url(#svg-mask-status-idle)"
                    className="pointerEvents__44b0c"
                  />
                </g>
              </svg>

              {/* Discord Avatar Decoration (Animated & Static Cycle) */}
              <svg
                width="182.4"
                height="182.4"
                viewBox="0 0 182.4 182.4"
                className="avatarDecorationContainer__44b0c absolute -top-[10%] -left-[10%] w-[120%] h-[120%] pointer-events-none z-10"
                aria-hidden="true"
              >
                <foreignObject x="0" y="0" width="182.4" height="182.4">
                  <canvas
                    ref={canvasRef}
                    width={288}
                    height={288}
                    className={`avatarDecoration__44b0c w-full h-full object-contain pointer-events-none ${
                      isCanvasReady ? 'block' : 'hidden'
                    }`}
                  />
                  {!isCanvasReady && (
                    <img
                      className="avatarDecoration__44b0c w-full h-full object-contain pointer-events-none"
                      alt=" "
                      aria-hidden="true"
                      src="https://cdn.discordapp.com/media/v1/collectibles-shop/1533914517329678408/static"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src =
                          '/avatar-decoration-static.png'
                      }}
                    />
                  )}
                </foreignObject>
              </svg>
            </div>
          </div>

          {/* User Display Name & Nitro Badge */}
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="discord-wordmark text-xl font-bold tracking-tight text-[#E0E1E5]">
              Fatih Farhat
            </h1>
            <div title="Nitro Subscriber" className="flex items-center shrink-0">
              <img
                alt="Ruby"
                className="badgeImage_a92dc5 w-5 h-5 object-contain"
                src="/assets/2801bd9ef48c1d87.svg"
              />
            </div>
          </div>

          {/* Username */}
          <div className="text-sm font-medium text-[#949BA4] mb-4">
            @zerotwenty
          </div>

          {/* Divider */}
          <div className="border-t border-[#1F2023]/70 my-3" />

          {/* Profile Details Flow (Direct on surface, NO nested box) */}
          <div className="flex flex-col gap-3.5">
            {/* Bio Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                About Me
              </span>
              <p className="text-sm text-[#DBDEE1] leading-relaxed">
                Un poco loco
              </p>
            </div>

            <div className="border-t border-[#1F2023]/50" />

            {/* Member Since Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                Member Since
              </span>
              <span className="text-sm text-[#DBDEE1]">
                Jun 14, 2018
              </span>
            </div>

            <div className="border-t border-[#1F2023]/50" />

            {/* Email Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                Email
              </span>
              <span className="text-sm text-[#DBDEE1] break-all">
                kazokuhairy@mail.com
              </span>
            </div>

            <div className="border-t border-[#1F2023]/50" />

            {/* Phone Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                Phone
              </span>
              <span className="text-sm text-[#DBDEE1]">
                (+62) 821-1150-0190
              </span>
            </div>

            <div className="border-t border-[#1F2023]/50" />

            {/* Linked Social Media Section (Direct on surface, NO nested box) */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                Linked Social Media
              </span>
              <div className="flex flex-col divide-y divide-[#1F2023]/50">
                {LINKED_SOCIAL_MEDIA.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <img
                          src={item.iconSrc}
                          alt={item.name}
                          className="w-6 h-6 rounded-[5px] object-contain select-none"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-[#E0E1E5] truncate">
                          {item.name}
                        </span>
                        <span className="text-xs text-[#949BA4] truncate">
                          {item.handle}
                        </span>
                      </div>
                    </div>

                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-[#949BA4] group-hover:text-[#DBDEE1] shrink-0 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1F2023]/50" />

            {/* Account Action Buttons: Switch Account (Top), Log Out (Middle), Purge Account (Bottom) */}
            <div className="flex flex-col gap-3 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
                Account Actions
              </span>

              {/* 1. Switch Account (Paling Atas - 3D Blurple Discord) */}
              <button
                type="button"
                onClick={() => setConfirmModal('switch')}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-gradient-to-b from-[#6975F7] to-[#4752C4] hover:brightness-110 active:scale-[0.99] active:translate-y-0.5 active:border-b-[1.5px] text-white ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#363FA0] font-bold text-sm flex items-center justify-center gap-2.5 transition-all select-none cursor-pointer"
                style={{
                  boxShadow: 'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(88, 101, 242, 0.4)',
                }}
              >
                <SwitchIcon className="w-4 h-4 text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]" />
                <span className="drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]">Switch Account</span>
              </button>

              {/* 2. Log Out (Tengah - 3D Neutral Slate Discord) */}
              <button
                type="button"
                onClick={() => setConfirmModal('logout')}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] hover:brightness-110 active:scale-[0.99] active:translate-y-0.5 active:border-b-[1.5px] text-white ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#232428] font-bold text-sm flex items-center justify-center gap-2.5 transition-all select-none cursor-pointer"
                style={{
                  boxShadow: 'inset 0 1.5px 2px rgba(255, 255, 255, 0.25), 0 4px 16px rgba(0, 0, 0, 0.35)',
                }}
              >
                <LogoutIcon className="w-4 h-4 text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]" />
                <span className="drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]">Log Out</span>
              </button>

              {/* 3. Purge Account (Paling Bawah - 3D Destructive Red) */}
              <button
                type="button"
                onClick={() => setConfirmModal('purge')}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] hover:brightness-110 active:scale-[0.99] active:translate-y-0.5 active:border-b-[1.5px] text-white ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#961D20] font-bold text-sm flex items-center justify-center gap-2.5 transition-all select-none cursor-pointer"
                style={{
                  boxShadow: 'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(242, 63, 67, 0.4)',
                }}
              >
                <TrashIcon className="w-4 h-4 text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]" />
                <span className="drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]">Purge Account</span>
              </button>

              {purgeFeedback && (
                <div className="mt-1 text-xs text-[#23A55A] text-center font-semibold">
                  {purgeFeedback}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Dialog Modals */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm bg-[#313338] rounded-2xl border border-[#1F2023] p-5 shadow-2xl flex flex-col gap-4 select-none"
              role="dialog"
              aria-modal="true"
            >
              {confirmModal === 'purge' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="discord-wordmark text-lg font-bold text-[#F23F43]">
                      Purge Account Data?
                    </h3>
                    <p className="text-xs text-[#DBDEE1] leading-relaxed">
                      Are you sure you want to purge your account? All savings goals, mutations, and transaction records will be permanently deleted from this device.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmModal(null)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[3.5px] border-[#232428] text-[#DBDEE1] font-bold text-xs ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all cursor-pointer min-h-[40px] flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onPurgeAccount?.()
                        setPurgeFeedback('Account data purged successfully.')
                        setConfirmModal(null)
                        setTimeout(() => setPurgeFeedback(null), 3000)
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[3.5px] border-[#961D20] text-white font-bold text-xs ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(242,63,67,0.4)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all cursor-pointer min-h-[40px] flex items-center justify-center"
                    >
                      Purge Everything
                    </button>
                  </div>
                </>
              )}

              {confirmModal === 'switch' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5]">
                      Switch Account
                    </h3>
                    <p className="text-xs text-[#949BA4]">
                      Select an account or add another account to manage.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 my-1">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#2B2D31] border border-[#1F2023]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/avatar.png"
                          alt="Fatih Farhat"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#E0E1E5]">
                            Fatih Farhat
                          </span>
                          <span className="text-[11px] text-[#949BA4]">
                            @zerotwenty
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#23A55A]">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchAccount?.()
                        setConfirmModal(null)
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[3.5px] border-[#232428] text-[#DBDEE1] font-bold text-xs ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all cursor-pointer min-h-[40px] flex items-center justify-center"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}

              {confirmModal === 'logout' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="discord-wordmark text-lg font-bold text-[#E0E1E5]">
                      Log Out
                    </h3>
                    <p className="text-xs text-[#DBDEE1] leading-relaxed">
                      Are you sure you want to log out of Discash? You can log back in at any time.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmModal(null)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[3.5px] border-[#232428] text-[#DBDEE1] font-bold text-xs ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all cursor-pointer min-h-[40px] flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLogout?.()
                        setConfirmModal(null)
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#FF5C5C] to-[#DA373C] border-b-[3.5px] border-[#961D20] text-white font-bold text-xs ring-2 ring-[#1E1F22] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_16px_rgba(242,63,67,0.4)] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99] transition-all cursor-pointer min-h-[40px] flex items-center justify-center"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
