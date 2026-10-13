interface TabHeaderProps {
  title: string
  className?: string
}

export function TabHeader({ title, className = '' }: TabHeaderProps) {
  return (
    <div className={`pt-1 pb-1 select-none shrink-0 ${className}`}>
      <h1
        className="discord-wordmark text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E8EAED] to-[#B5BAC1] tracking-tight leading-tight select-none"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))',
        }}
      >
        {title}
      </h1>
    </div>
  )
}
