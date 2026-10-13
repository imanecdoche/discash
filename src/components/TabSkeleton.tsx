import type { NavTab } from './BottomNavbar'

interface TabSkeletonProps {
  tab: NavTab
}

export function TabSkeleton({ tab }: TabSkeletonProps) {
  if (tab === 'dashboard') {
    return (
      <div className="flex flex-col gap-4 animate-pulse select-none" aria-busy="true" aria-label="Loading dashboard">
        {/* Total IDR Card Skeleton */}
        <div className="rounded-2xl bg-[#2B2D31] border border-[#1F2023]/60 p-5 shadow-lg flex flex-col gap-3">
          <div className="h-3.5 w-24 rounded-md bg-[#383A40]" />
          <div className="h-8 w-44 rounded-md bg-[#42454B]" />
        </div>
      </div>
    )
  }

  if (tab === 'goal') {
    return (
      <div
        className="flex-1 w-full min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 animate-pulse select-none"
        aria-busy="true"
        aria-label="Loading goals"
      >
        {/* Goal Empty State Skeleton */}
        <div className="w-16 h-16 rounded-full bg-[#383A40] mb-4" />
        <div className="h-5 w-32 rounded-md bg-[#42454B] mb-2.5" />
        <div className="h-3.5 w-52 rounded-md bg-[#383A40] mb-1.5" />
        <div className="h-3.5 w-36 rounded-md bg-[#383A40]" />
      </div>
    )
  }

  // Profile & Settings Tab Skeletons
  return (
    <div
      className="flex-1 w-full min-h-[50vh] flex flex-col items-center justify-center px-4 py-12 animate-pulse select-none"
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="w-16 h-16 rounded-full bg-[#383A40] mb-4" />
      <div className="h-5 w-36 rounded-md bg-[#42454B] mb-2" />
      <div className="h-3.5 w-48 rounded-md bg-[#383A40]" />
    </div>
  )
}
