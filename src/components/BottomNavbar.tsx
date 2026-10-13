import { useState } from 'react'
import { motion } from 'framer-motion'

export type NavTab = 'dashboard' | 'goal' | 'profile' | 'settings'

interface BottomNavbarProps {
  activeTab?: NavTab
  onTabChange?: (tab: NavTab) => void
  onAddClick?: () => void
}

const TACTILE_SVG_STYLE = {
  filter:
    'drop-shadow(0 2.5px 0px #31378A) drop-shadow(0 3.5px 1px #20245E) drop-shadow(0 6px 14px rgba(88, 101, 242, 0.6))',
}

function DashboardIcon({ className, isActive }: { className?: string; isActive?: boolean }) {
  const fill = isActive ? 'url(#dash-tactile-grad)' : 'currentColor'

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={isActive ? TACTILE_SVG_STYLE : undefined}
    >
      <defs>
        <linearGradient id="dash-tactile-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7983F5" />
          <stop offset="100%" stopColor="#4752C4" />
        </linearGradient>
      </defs>

      {/* Box 1 (Top-Left): Dimulai panjang (h=8.5) -> memendek (h=5) -> memanjang kembali (h=8.5) */}
      <motion.rect
        x="3"
        width="7.5"
        rx="2"
        fill={fill}
        initial={{ y: 3, height: 8.5 }}
        animate={
          isActive
            ? {
                y: [3, 6.5, 2.5, 3],
                height: [8.5, 5, 9, 8.5],
              }
            : { y: 3, height: 8.5 }
        }
        transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Box 2 (Top-Right): Dimulai pendek (h=5.5) -> memanjang (h=9) -> memendek kembali (h=5.5) */}
      <motion.rect
        x="13.5"
        width="7.5"
        rx="2"
        fill={fill}
        initial={{ y: 3, height: 5.5 }}
        animate={
          isActive
            ? {
                y: [3, 3, 3, 3],
                height: [5.5, 9, 5, 5.5],
              }
            : { y: 3, height: 5.5 }
        }
        transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Box 3 (Bottom-Left): Dimulai pendek (h=5.5) -> memanjang ke atas (h=9) -> memendek kembali (h=5.5) */}
      <motion.rect
        x="3"
        width="7.5"
        rx="2"
        fill={fill}
        initial={{ y: 15.5, height: 5.5 }}
        animate={
          isActive
            ? {
                y: [15.5, 12, 16, 15.5],
                height: [5.5, 9, 5, 5.5],
              }
            : { y: 15.5, height: 5.5 }
        }
        transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Box 4 (Bottom-Right): Dimulai panjang (h=8.5) -> memendek (h=5) -> memanjang kembali (h=8.5) */}
      <motion.rect
        x="13.5"
        width="7.5"
        rx="2"
        fill={fill}
        initial={{ y: 12.5, height: 8.5 }}
        animate={
          isActive
            ? {
                y: [12.5, 16, 12, 12.5],
                height: [8.5, 5, 9, 8.5],
              }
            : { y: 12.5, height: 8.5 }
        }
        transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  )
}

function GoalIcon({ className, isActive }: { className?: string; isActive?: boolean }) {
  const stroke = isActive ? 'url(#goal-tactile-grad)' : 'currentColor'
  const fill = isActive ? 'url(#goal-tactile-grad)' : 'currentColor'

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      style={isActive ? TACTILE_SVG_STYLE : undefined}
    >
      <defs>
        <linearGradient id="goal-tactile-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7983F5" />
          <stop offset="100%" stopColor="#4752C4" />
        </linearGradient>
      </defs>

      {/* Ripple wave 1: Riak gelombang memancar keluar saat aktif */}
      <motion.circle
        cx="12"
        cy="12"
        r="5"
        stroke={stroke}
        strokeWidth="1.6"
        fill="none"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={
          isActive
            ? {
                scale: [0.6, 1.85],
                opacity: [0.85, 0],
              }
            : { scale: 0.6, opacity: 0 }
        }
        transition={{ duration: 0.75, ease: 'easeOut' }}
        style={{ transformOrigin: '12px 12px' }}
      />

      {/* Ripple wave 2: Riak gelombang kedua menyusul */}
      <motion.circle
        cx="12"
        cy="12"
        r="5"
        stroke={stroke}
        strokeWidth="1.2"
        fill="none"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={
          isActive
            ? {
                scale: [0.6, 2.05],
                opacity: [0.75, 0],
              }
            : { scale: 0.6, opacity: 0 }
        }
        transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        style={{ transformOrigin: '12px 12px' }}
      />

      {/* Outer target circle: Denyut gelombang elastis di lingkaran luar */}
      <motion.circle
        cx="12"
        cy="12"
        r="8.8"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ scale: 1, strokeWidth: 2.2 }}
        animate={
          isActive
            ? {
                scale: [1, 1.18, 0.88, 1.08, 0.97, 1],
                strokeWidth: [2.2, 3, 1.9, 2.5, 2.2],
              }
            : { scale: 1, strokeWidth: 2.2 }
        }
        style={{ transformOrigin: '12px 12px' }}
        transition={{ duration: 0.85, delay: 0.14, ease: [0.34, 1.56, 0.64, 1] }}
      />

      {/* Middle target circle: Denyut gelombang elastis di lingkaran tengah */}
      <motion.circle
        cx="12"
        cy="12"
        r="5.2"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ scale: 1, strokeWidth: 2.2 }}
        animate={
          isActive
            ? {
                scale: [1, 1.32, 0.82, 1.15, 0.94, 1],
                strokeWidth: [2.2, 3.2, 1.8, 2.6, 2.2],
              }
            : { scale: 1, strokeWidth: 2.2 }
        }
        style={{ transformOrigin: '12px 12px' }}
        transition={{ duration: 0.8, delay: 0.07, ease: [0.34, 1.56, 0.64, 1] }}
      />

      {/* Center bullseye dot: Ledakan denyut riak pertama dari pusat */}
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        fill={fill}
        initial={{ scale: 1 }}
        animate={
          isActive
            ? {
                scale: [1, 1.8, 0.6, 1.3, 0.9, 1],
              }
            : { scale: 1 }
        }
        style={{ transformOrigin: '12px 12px' }}
        transition={{ duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// Icon Profile: Menggunakan asset resmi Discord (my-account.svg) dengan animasi lengan melambai halus & natural
const DISCORD_HEAD_PATH =
  'M50 43.4999C53.5362 43.4999 56.9276 42.0952 59.4281 39.5947C61.9285 37.0942 63.3333 33.7028 63.3333 30.1666C63.3333 26.6304 61.9285 23.239 59.4281 20.7385C56.9276 18.238 53.5362 16.8333 50 16.8333C46.4637 16.8333 43.0724 18.238 40.5719 20.7385C38.0714 23.239 36.6666 26.6304 36.6666 30.1666C36.6666 33.7028 38.0714 37.0942 40.5719 39.5947C43.0724 42.0952 46.4637 43.4999 50 43.4999Z'

// Path tubuh Discord saat lengan istirahat di samping (100% identik dengan my-account.svg)
const DISCORD_BODY_REST =
  'M48.4333 46.8333C40.0082 46.8333 31.9283 50.1801 25.9709 56.1375C20.0135 62.0949 16.6666 70.1749 16.6666 78.5999C16.6666 81.2999 18.8666 83.4999 21.5666 83.4999H22.3C23.1 83.4999 23.7666 82.9333 23.9666 82.1666C24.9333 78.4333 26.7666 74.9333 28.3666 72.4666C28.8333 71.7666 29.8 72.1333 29.7 72.9666L28.8333 81.6666C28.7666 82.6666 29.5 83.4999 30.5 83.4999H69.5C69.7336 83.5011 69.9649 83.4531 70.1787 83.3592C70.3926 83.2652 70.5844 83.1273 70.7415 82.9544C70.8987 82.7815 71.0178 82.5775 71.091 82.3557C71.1642 82.1338 71.19 81.899 71.1666 81.6666L70.2666 72.9999C70.2 72.1333 71.1666 71.7666 71.6333 72.4666C73.2333 74.9333 75.0666 78.4666 76.0333 82.1333C76.2333 82.9333 76.9 83.4999 77.7 83.4999H78.4333C81.1333 83.4999 83.3333 81.2999 83.3333 78.5999C83.3333 70.1749 79.9865 62.0949 74.029 56.1375C68.0716 50.1801 59.9917 46.8333 51.5666 46.8333H48.4333Z'

// Path tubuh Discord saat lengan terangkat melambai ke kanan (👋)
const DISCORD_BODY_WAVE_R =
  'M48.4333 46.8333C40.0082 46.8333 31.9283 50.1801 25.9709 56.1375C20.0135 62.0949 16.6666 70.1749 16.6666 78.5999C16.6666 81.2999 18.8666 83.4999 21.5666 83.4999H22.3C23.1 83.4999 23.7666 82.9333 23.9666 82.1666C24.9333 78.4333 26.7666 74.9333 28.3666 72.4666C28.8333 71.7666 29.8 72.1333 29.7 72.9666L28.8333 81.6666C28.7666 82.6666 29.5 83.4999 30.5 83.4999H69.5C70.2 83.5 70.8 83.2 71.2 82.8C71.5 82.5 71.8 82.0 72.0 81.5C72.2 80.8 72.3 80.0 72.4 79.0C72.4 77.5 72.4 76.0 72.3 74.0L72.0 66.0C73.5 61.5 76.0 57.5 80.0 58.0C83.5 58.5 87.0 49.0 89.0 38.0C89.5 33.5 86.5 32.0 83.0 33.5H81.0C78.5 36.5 77.5 43.5 76.5 49.5C75.5 53.5 75.0 55.0 74.029 56.1375C68.0716 50.1801 59.9917 46.8333 51.5666 46.8333H48.4333Z'

// Path tubuh Discord saat lengan terangkat melambai ke kiri (👋)
const DISCORD_BODY_WAVE_L =
  'M48.4333 46.8333C40.0082 46.8333 31.9283 50.1801 25.9709 56.1375C20.0135 62.0949 16.6666 70.1749 16.6666 78.5999C16.6666 81.2999 18.8666 83.4999 21.5666 83.4999H22.3C23.1 83.4999 23.7666 82.9333 23.9666 82.1666C24.9333 78.4333 26.7666 74.9333 28.3666 72.4666C28.8333 71.7666 29.8 72.1333 29.7 72.9666L28.8333 81.6666C28.7666 82.6666 29.5 83.4999 30.5 83.4999H69.5C70.2 83.5 70.8 83.2 71.2 82.8C71.5 82.5 71.8 82.0 72.0 81.5C72.2 80.8 72.3 80.0 72.4 79.0C72.4 77.5 72.4 76.0 72.3 74.0L72.0 66.0C73.5 61.5 75.0 57.5 78.0 58.0C81.0 58.5 83.0 49.0 84.5 38.0C85.0 33.5 82.0 32.0 78.5 33.5H76.5C74.5 36.5 74.5 43.5 74.5 49.5C74.5 53.5 74.5 55.0 74.029 56.1375C68.0716 50.1801 59.9917 46.8333 51.5666 46.8333H48.4333Z'

function ProfileIcon({ className, isActive }: { className?: string; isActive?: boolean }) {
  const fill = isActive ? 'url(#profile-tactile-grad)' : 'currentColor'

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={isActive ? TACTILE_SVG_STYLE : undefined}
    >
      <defs>
        <linearGradient id="profile-tactile-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7983F5" />
          <stop offset="100%" stopColor="#4752C4" />
        </linearGradient>
      </defs>

      {/* Kepala Avatar Discord: Mengangguk ramah dan ceria saat aktif */}
      <motion.path
        d={DISCORD_HEAD_PATH}
        fill={fill}
        initial={{ rotate: 0 }}
        animate={
          isActive
            ? {
                rotate: [0, 6, -5, 5, 0],
              }
            : { rotate: 0 }
        }
        style={{ transformOrigin: '50px 38px' }}
        transition={{ duration: 1.05, ease: 'easeInOut' }}
      />

      {/* Tubuh Avatar Discord: Lengan kanan terangkat dan melambai (👋) secara mulus dan kembali ke posisi istirahat */}
      <motion.path
        fill={fill}
        d={DISCORD_BODY_REST}
        animate={
          isActive
            ? {
                d: [
                  DISCORD_BODY_REST,
                  DISCORD_BODY_WAVE_R,
                  DISCORD_BODY_WAVE_L,
                  DISCORD_BODY_WAVE_R,
                  DISCORD_BODY_REST,
                ],
              }
            : { d: DISCORD_BODY_REST }
        }
        transition={{
          duration: 1.05,
          times: [0, 0.28, 0.52, 0.76, 1],
          ease: 'easeInOut',
        }}
      />
    </svg>
  )
}

function SettingsIcon({ className, isActive }: { className?: string; isActive?: boolean }) {
  const fill = isActive ? 'url(#settings-tactile-grad)' : 'currentColor'

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={isActive ? TACTILE_SVG_STYLE : undefined}
    >
      <defs>
        <linearGradient id="settings-tactile-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7983F5" />
          <stop offset="100%" stopColor="#4752C4" />
        </linearGradient>
      </defs>

      {/* Gerigi roda gigi SVG yang berputar penuh pada poros tengah (50px, 50px) */}
      <motion.g
        initial={{ rotate: 0 }}
        animate={
          isActive
            ? {
                rotate: [0, 90, 180, 270, 360],
              }
            : { rotate: 0 }
        }
        style={{ transformOrigin: '50px 50px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <path
          fill={fill}
          d="M45.1934 13.8133C43.6834 14.01 42.8434 15.5833 43.0734 17.09C43.6667 20.9767 42.45 24.43 39.7967 25.53C37.1434 26.63 33.84 25.05 31.5134 21.8833C30.61 20.6567 28.9 20.1367 27.6934 21.0633C25.14 23.0233 22.8567 25.3067 20.8967 27.86C19.97 29.0667 20.49 30.7767 21.7167 31.68C24.8834 34.0067 26.4634 37.31 25.3634 39.9633C24.2634 42.6167 20.81 43.8333 16.9234 43.24C15.4167 43.01 13.8434 43.85 13.6467 45.36C13.44 46.9333 13.3334 48.5367 13.3334 50.1667C13.3334 51.7967 13.44 53.4 13.6467 54.9733C13.8434 56.4833 15.4167 57.3233 16.9234 57.0933C20.81 56.5 24.2634 57.7167 25.3634 60.37C26.4634 63.0233 24.8834 66.3233 21.7167 68.6533C20.49 69.5567 19.97 71.2633 20.8967 72.4733C22.8567 75.0267 25.14 77.31 27.6934 79.27C28.9 80.1967 30.61 79.6767 31.5134 78.45C33.84 75.2833 37.1434 73.7033 39.7967 74.8033C42.45 75.9033 43.6667 79.3567 43.0734 83.2433C42.8434 84.75 43.6834 86.3233 45.1934 86.52C46.7667 86.7267 48.37 86.8333 50 86.8333C51.63 86.8333 53.2334 86.7267 54.8067 86.52C56.3167 86.3233 57.1567 84.75 56.9267 83.2433C56.3334 79.3567 57.5534 75.9033 60.2067 74.8033C62.86 73.7033 66.16 75.2833 68.4867 78.45C69.39 79.6767 71.0967 80.1967 72.3067 79.27C74.86 77.31 77.1434 75.0267 79.1034 72.4733C80.03 71.2633 79.51 69.5567 78.2834 68.6533C75.1167 66.3267 73.5367 63.0233 74.6367 60.37C75.7367 57.7167 79.19 56.5 83.0767 57.0933C84.5834 57.3233 86.1567 56.4833 86.3534 54.9733C86.56 53.4 86.6667 51.7967 86.6667 50.1667C86.6667 48.5367 86.56 46.9333 86.3534 45.36C86.1567 43.85 84.5834 43.01 83.0767 43.24C79.19 43.8333 75.7367 42.6167 74.6367 39.9633C73.5367 37.31 75.1167 34.0067 78.2834 31.68C79.51 30.7767 80.03 29.0667 79.1034 27.86C77.1434 25.3067 74.86 23.0233 72.3067 21.0633C71.0967 20.1367 69.3934 20.6567 68.49 21.8833C66.1634 25.05 62.86 26.63 60.2067 25.53C57.5534 24.43 56.3367 20.9767 56.93 17.09C57.16 15.5833 56.3167 14.01 54.8067 13.8133C53.2334 13.6067 51.63 13.5 50 13.5C48.37 13.5 46.7667 13.6067 45.1934 13.8133ZM63.3334 50.1667C63.3334 57.53 57.3634 63.5 50 63.5C42.6367 63.5 36.6667 57.53 36.6667 50.1667C36.6667 42.8033 42.6367 36.8333 50 36.8333C57.3634 36.8333 63.3334 42.8033 63.3334 50.1667Z"
        />
      </motion.g>
    </svg>
  )
}

export function BottomNavbar({
  activeTab: controlledActiveTab,
  onTabChange,
  onAddClick,
}: BottomNavbarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<NavTab>('dashboard')
  const activeTab = controlledActiveTab ?? internalActiveTab

  const handleTabClick = (tab: NavTab) => {
    setInternalActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <nav
      aria-label="Bottom Navigation"
      className="shrink-0 z-30 w-full bg-[#1E1F22] border-t border-[#111214]/60 px-3 pt-2 pb-2 select-none"
    >
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {/* Tab 1: Dashboard - Bebas tanpa box, SVG-nya sendiri yang tactile 3D */}
        <button
          type="button"
          onClick={() => handleTabClick('dashboard')}
          aria-label="Dashboard"
          className="relative flex items-center justify-center w-12 h-12 transition-all select-none cursor-pointer active:scale-90 active:translate-y-0.5"
        >
          <DashboardIcon
            className={`w-7 h-7 transition-colors ${
              activeTab === 'dashboard' ? '' : 'text-[#949BA4] hover:text-[#DBDEE1]'
            }`}
            isActive={activeTab === 'dashboard'}
          />
        </button>

        {/* Tab 2: Goal - Bebas tanpa box, SVG-nya sendiri yang tactile 3D */}
        <button
          type="button"
          onClick={() => handleTabClick('goal')}
          aria-label="Goal"
          className="relative flex items-center justify-center w-12 h-12 transition-all select-none cursor-pointer active:scale-90 active:translate-y-0.5"
        >
          <GoalIcon
            className={`w-7 h-7 transition-colors ${
              activeTab === 'goal' ? '' : 'text-[#949BA4] hover:text-[#DBDEE1]'
            }`}
            isActive={activeTab === 'goal'}
          />
        </button>

        {/* Center CTA (+): Bulat warna ungu Discord - 3D Tactile Dimensional Floating */}
        <div className="relative -top-5 flex items-center justify-center">
          <button
            type="button"
            onClick={onAddClick}
            aria-label="Add Goal or Income"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#6975F7] to-[#4752C4] hover:brightness-110 active:scale-95 active:translate-y-0.5 active:border-b-[1.5px] text-white ring-4 ring-[#1E1F22] border-b-[3.5px] border-[#363FA0] transition-all duration-150 select-none cursor-pointer"
            style={{
              boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.45), 0 8px 24px rgba(88, 101, 242, 0.45)',
            }}
          >
            <PlusIcon className="w-7 h-7 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.3)]" />
          </button>
        </div>

        {/* Tab 3: User Profile - Menggunakan asset Discord resmi dengan animasi lengan melambai */}
        <button
          type="button"
          onClick={() => handleTabClick('profile')}
          aria-label="User Profile"
          className="relative flex items-center justify-center w-12 h-12 transition-all select-none cursor-pointer active:scale-90 active:translate-y-0.5"
        >
          <ProfileIcon
            className={`w-7 h-7 transition-colors ${
              activeTab === 'profile' ? '' : 'text-[#949BA4] hover:text-[#DBDEE1]'
            }`}
            isActive={activeTab === 'profile'}
          />
        </button>

        {/* Tab 4: Settings - Bebas tanpa box, SVG-nya sendiri yang tactile 3D */}
        <button
          type="button"
          onClick={() => handleTabClick('settings')}
          aria-label="Settings"
          className="relative flex items-center justify-center w-12 h-12 transition-all select-none cursor-pointer active:scale-90 active:translate-y-0.5"
        >
          <SettingsIcon
            className={`w-7 h-7 transition-colors ${
              activeTab === 'settings' ? '' : 'text-[#949BA4] hover:text-[#DBDEE1]'
            }`}
            isActive={activeTab === 'settings'}
          />
        </button>
      </div>
    </nav>
  )
}
