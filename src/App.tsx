import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import { BottomNavbar, type NavTab } from './components/BottomNavbar'
import { SplashScreen } from './components/SplashScreen'
import { TotalBalanceCard } from './components/TotalBalanceCard'
import { TotalGoalsCard } from './components/TotalGoalsCard'
import { BudgetDistributionCard } from './components/BudgetDistributionCard'
import { GoalPage } from './components/GoalPage'
import { AccountProfilePage } from './components/AccountProfilePage'
import { NewGoalSheet } from './components/NewGoalSheet'
import { GoalDetailSheet } from './components/GoalDetailSheet'
import { NotificationHistorySheet } from './components/NotificationHistorySheet'
import { TransactionReceiptSheet } from './components/TransactionReceiptSheet'
import { SettingsPage } from './components/SettingsPage'
import { TabHeader } from './components/TabHeader'
import {
  type CurrencySettings,
  getCurrencySettings,
  saveCurrencySettings,
} from './utils/formatters'
import type { Goal, GoalTransaction } from './types/goal'

const TAB_ORDER: NavTab[] = ['dashboard', 'goal', 'profile', 'settings']

// Variasi animasi slide horizontal langsung & simultan tanpa jeda
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
  }),
  center: {
    x: '0%',
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
  }),
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [direction, setDirection] = useState<number>(1)
  const [isNewGoalSheetOpen, setIsNewGoalSheetOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isGoalDetailOpen, setIsGoalDetailOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<{
    transaction: GoalTransaction
    goalTitle?: string
    goalIcon?: string
    goalCustomPhoto?: string
  } | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(getCurrencySettings)

  const handleUpdateCurrencySettings = (newSettings: CurrencySettings) => {
    saveCurrencySettings(newSettings)
    setCurrencySettings(newSettings)
  }


  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem('discash_goals')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Fallback
    }
    return []
  })

  // Sinkronisasi goals ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem('discash_goals', JSON.stringify(goals))
    } catch {
      // Ignore storage error
    }
  }, [goals])

  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const mouseStartX = useRef<number | null>(null)

  const [goalDetailInitialMode, setGoalDetailInitialMode] = useState<'detail' | 'edit'>('detail')

  // Kalkulasi dinamis total balance dari goal aktif (exclude archived)
  const activeGoals = goals.filter((g) => !g.isArchived)
  const totalBalance = activeGoals.reduce((acc, goal) => acc + (goal.currentAmount || 0), 0)

  const handleSaveGoal = (newGoal: Goal) => {
    setGoals((prev) => [newGoal, ...prev])
    setIsNewGoalSheetOpen(false)
    handleTabChange('goal')
  }

  const handleOpenGoalDetail = (goal: Goal, mode: 'detail' | 'edit' = 'detail') => {
    setSelectedGoal(goal)
    setGoalDetailInitialMode(mode)
    setIsGoalDetailOpen(true)
  }

  const handleCloseGoalDetail = () => {
    setIsGoalDetailOpen(false)
    setGoalDetailInitialMode('detail')
  }

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
    )
    setSelectedGoal(updatedGoal)
  }

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId))
    setIsGoalDetailOpen(false)
  }

  const handleOpenReceipt = (transaction: GoalTransaction, goal?: Goal) => {
    setReceiptData({
      transaction,
      goalTitle: goal?.title,
      goalIcon: goal?.icon,
      goalCustomPhoto: goal?.customPhoto,
    })
    setIsReceiptOpen(true)
  }

  const handleDeleteTransactionFromReceipt = (transactionId: string) => {
    if (!receiptData?.transaction) return
    const targetGoalId = receiptData.transaction.goalId
    const goal = goals.find((g) => g.id === targetGoalId)
    if (!goal) return

    const targetTrx = (goal.transactions || []).find((t) => t.id === transactionId)
    if (!targetTrx) return

    const revertedCurrentAmount =
      targetTrx.type === 'deposit'
        ? Math.max(0, goal.currentAmount - targetTrx.amount)
        : goal.currentAmount + targetTrx.amount

    const updatedGoal: Goal = {
      ...goal,
      currentAmount: revertedCurrentAmount,
      updatedAt: new Date().toISOString(),
      transactions: (goal.transactions || []).filter((t) => t.id !== transactionId),
    }

    handleUpdateGoal(updatedGoal)
    setIsReceiptOpen(false)
  }

  const handlePurgeAccount = () => {
    try {
      localStorage.removeItem('discash_goals')
    } catch {
      // ignore
    }
    setGoals([])
    setSelectedGoal(null)
    setIsGoalDetailOpen(false)
    setIsReceiptOpen(false)
  }

  const handleLogout = () => {
    handleTabChange('dashboard')
  }

  const handleSwitchAccount = () => {
    handleTabChange('dashboard')
  }

  // Transisi langsung tanpa delay: tab asal geser keluar, tab baru langsung geser masuk
  const handleTabChange = (newTab: NavTab) => {
    if (newTab === activeTab) return

    const currentIndex = TAB_ORDER.indexOf(activeTab)
    const newIndex = TAB_ORDER.indexOf(newTab)
    const newDirection = newIndex > currentIndex ? 1 : -1

    setDirection(newDirection)
    setActiveTab(newTab)
  }

  // Gestur Swipe: Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current

    // Cek jika sapuan horizontal lebih dominan dari scroll vertikal (threshold 45px)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentIndex = TAB_ORDER.indexOf(activeTab)
      if (deltaX < 0 && currentIndex < TAB_ORDER.length - 1) {
        // Swipe ke kiri -> Tab berikutnya
        handleTabChange(TAB_ORDER[currentIndex + 1])
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swipe ke kanan -> Tab sebelumnya
        handleTabChange(TAB_ORDER[currentIndex - 1])
      }
    }
  }

  // Gestur Swipe: Mouse Drag (untuk desktop browser)
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return
    const deltaX = e.clientX - mouseStartX.current

    if (Math.abs(deltaX) > 50) {
      const currentIndex = TAB_ORDER.indexOf(activeTab)
      if (deltaX < 0 && currentIndex < TAB_ORDER.length - 1) {
        handleTabChange(TAB_ORDER[currentIndex + 1])
      } else if (deltaX > 0 && currentIndex > 0) {
        handleTabChange(TAB_ORDER[currentIndex - 1])
      }
    }
    mouseStartX.current = null
  }

  return (
    <>
      {/* Fullscreen Reload / Initial Load Splash Screen */}
      <SplashScreen />

      {/* Main Mobile App Container */}
      <div className="h-full w-full bg-[#111214] flex justify-center items-center overflow-hidden select-none">
        <div
          className="w-full max-w-[430px] h-full bg-[#313338] flex flex-col relative overflow-hidden sm:rounded-3xl"
        >
          {/* Sticky Header on Top */}
          <Header onNotificationClick={() => setIsNotificationOpen(true)} />

          {/* Area Konten Utama dengan Swipe Gestur & Immediate Slide Transition */}
          <main
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className="relative flex-1 min-h-0 w-full overflow-hidden flex flex-col touch-pan-y cursor-grab active:cursor-grabbing"
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={activeTab}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.22 },
                }}
                className="w-full h-full flex-1 min-h-0 flex flex-col overflow-y-auto px-4 pt-3 pb-4 overscroll-contain transform-gpu will-change-transform"
              >
                {/* Tab: Dashboard */}
                {activeTab === 'dashboard' && (
                  <div className="flex flex-col gap-4">
                    <TabHeader title="Dashboard" />

                    {/* Kartu Total IDR di Paling Atas */}
                    <TotalBalanceCard totalAmount={totalBalance} label="Total Savings" />

                    {/* Total Goals Statistics */}
                    <TotalGoalsCard goals={activeGoals} />

                    {/* Budget Distribution */}
                    <BudgetDistributionCard
                      goals={activeGoals}
                      onSelectGoal={(goal) => handleOpenGoalDetail(goal, 'detail')}
                    />
                  </div>
                )}

                {/* Tab: Goal */}
                {activeTab === 'goal' && (
                  <GoalPage
                    goals={goals}
                    onSelectGoal={(goal) => handleOpenGoalDetail(goal, 'detail')}
                    onUpdateGoal={handleUpdateGoal}
                    onDeleteGoal={handleDeleteGoal}
                    onEditGoal={(goal) => handleOpenGoalDetail(goal, 'edit')}
                  />
                )}

                {/* Tab: User Profile */}
                {activeTab === 'profile' && (
                  <AccountProfilePage
                    onPurgeAccount={handlePurgeAccount}
                    onLogout={handleLogout}
                    onSwitchAccount={handleSwitchAccount}
                  />
                )}

                {/* Tab: Settings */}
                {activeTab === 'settings' && (
                  <SettingsPage
                    settings={currencySettings}
                    onUpdateSettings={handleUpdateCurrencySettings}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Bottom Navigation Bar */}
          <BottomNavbar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAddClick={() => {
              setIsNewGoalSheetOpen(true)
            }}
          />
        </div>
      </div>

      {/* New Goal Creation Bottom Sheet Modal */}
      <NewGoalSheet
        isOpen={isNewGoalSheetOpen}
        onClose={() => setIsNewGoalSheetOpen(false)}
        onSaveGoal={handleSaveGoal}
      />

      {/* Goal Detail Sheet Modal (Deposit/Withdraw, Edit, Delete, Transaction History) */}
      <GoalDetailSheet
        isOpen={isGoalDetailOpen}
        goal={selectedGoal}
        onClose={handleCloseGoalDetail}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onSelectTransaction={handleOpenReceipt}
        initialMode={goalDetailInitialMode}
      />

      {/* Global Notification Sheet: All Transactions Across All Goals */}
      <NotificationHistorySheet
        isOpen={isNotificationOpen}
        goals={goals}
        onClose={() => setIsNotificationOpen(false)}
        onSelectTransaction={(trx, goal) => handleOpenReceipt(trx, goal)}
      />

      {/* Digital Transaction Receipt / Invoice Modal Sheet */}
      <TransactionReceiptSheet
        isOpen={isReceiptOpen}
        transaction={receiptData?.transaction ?? null}
        goalTitle={receiptData?.goalTitle}
        goalIcon={receiptData?.goalIcon}
        goalCustomPhoto={receiptData?.goalCustomPhoto}
        onClose={() => setIsReceiptOpen(false)}
        onDeleteTransaction={handleDeleteTransactionFromReceipt}
      />
    </>
  )
}
