import { DiscordLogo } from './DiscordLogo'

interface HeaderProps {
  onNotificationClick?: () => void
}

export function Header({ onNotificationClick }: HeaderProps) {
  return (
    <header className="shrink-0 z-30 w-full bg-[#1E1F22] border-b border-[#111214]/60 px-4 py-3 select-none flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <DiscordLogo className="w-7 h-7 shrink-0" color="#5865F2" />
        <span className="discord-wordmark text-[1.35rem] font-black tracking-[-0.04em] leading-none select-none text-[#E0E1E5]">
          Discash
        </span>
      </div>

      {/* Icon Notifikasi (Tanpa Box / Murni Tombol Icon) */}
      <button
        type="button"
        onClick={onNotificationClick}
        aria-label="Transaction History Notifications"
        className="text-[#949BA4] hover:text-[#DBDEE1] active:scale-90 transition-all cursor-pointer p-1 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-6 h-6"
          fill="currentColor"
        >
          <path d="M42.3333 19.6333C42.9333 19.4 43.4 18.8333 43.5667 18.2C43.9505 16.7877 44.7883 15.5409 45.951 14.6521C47.1137 13.7632 48.5365 13.2816 50 13.2816C51.4635 13.2816 52.8863 13.7632 54.049 14.6521C55.2117 15.5409 56.0495 16.7877 56.4333 18.2C56.6 18.8666 57.0667 19.4 57.7 19.6333C62.2693 21.2306 66.2288 24.2095 69.0298 28.1573C71.8308 32.105 73.3348 36.8261 73.3333 41.6666V48.6333C73.3333 49.0333 73.5 49.4333 73.7667 49.7333L77.4333 53.7999C79.0882 55.6389 80.0027 58.026 80 60.4999V61.4333C80 63.6666 78.8667 65.7333 76.8333 66.6333C72.4667 68.6333 63.5 71.6666 50 71.6666C36.5 71.6666 27.5333 68.6333 23.1667 66.6666C21.1333 65.7333 20 63.6666 20 61.4333V60.4999C20.0056 58.0375 20.9195 55.6637 22.5667 53.8333L26.2333 49.7333C26.5073 49.4319 26.6615 49.0406 26.6667 48.6333V41.6666C26.6676 36.8221 28.1764 32.098 30.9838 28.1498C33.7911 24.2016 37.7578 21.2251 42.3333 19.6333ZM40.6 76.1333C40.5246 76.1238 40.448 76.1305 40.3754 76.153C40.3028 76.1755 40.2358 76.2133 40.179 76.2638C40.1222 76.3143 40.0768 76.3764 40.0459 76.4459C40.0151 76.5153 39.9994 76.5906 40 76.6666C40 79.3188 41.0536 81.8623 42.9289 83.7377C44.8043 85.6131 47.3478 86.6666 50 86.6666C52.6522 86.6666 55.1957 85.6131 57.0711 83.7377C58.9464 81.8623 60 79.3188 60 76.6666C60 76.3333 59.7 76.1 59.4 76.1333C53.1536 76.8464 46.8464 76.8464 40.6 76.1333Z" />
        </svg>
      </button>
    </header>
  )
}
