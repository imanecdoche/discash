import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import { BottomNavbar, type NavTab } from './components/BottomNavbar'
import { SplashScreen } from './components/SplashScreen'
import { TotalBalanceCard } from './components/TotalBalanceCard'
import { TotalGoalsCard } from './components/TotalGoalsCard'
import { BudgetDistributionCard } from './components/BudgetDistributionCard'
import { AssetsDistributionCard } from './components/AssetsDistributionCard'
import { GoalPage } from './components/GoalPage'
import { AccountProfilePage } from './components/AccountProfilePage'
import { NewGoalSheet } from './components/NewGoalSheet'
import { GoalDetailSheet } from './components/GoalDetailSheet'
import { NotificationHistorySheet } from './components/NotificationHistorySheet'
import { TransactionReceiptSheet } from './components/TransactionReceiptSheet'
import { SettingsPage } from './components/SettingsPage'
import { TabHeader } from './components/TabHeader'
import { WalletPage } from './components/WalletPage'
import { NewWalletSheet } from './components/NewWalletSheet'
import { WalletDetailSheet } from './components/WalletDetailSheet'
import {
  type CurrencySettings,
  getCurrencySettings,
  saveCurrencySettings,
} from './utils/formatters'
import type { Goal, GoalTransaction } from './types/goal'
import type { Wallet, WalletTransaction } from './types/wallet'

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

  // Wallet states
  const [isWalletPageOpen, setIsWalletPageOpen] = useState(false)
  const [isNewWalletSheetOpen, setIsNewWalletSheetOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [isWalletDetailOpen, setIsWalletDetailOpen] = useState(false)
  const [walletDetailInitialMode, setWalletDetailInitialMode] = useState<'detail' | 'edit'>('detail')

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

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    try {
      const saved = localStorage.getItem('discash_wallets')
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

  // Sinkronisasi wallets ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem('discash_wallets', JSON.stringify(wallets))
    } catch {
      // Ignore storage error
    }
  }, [wallets])

  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const mouseStartX = useRef<number | null>(null)

  const [goalDetailInitialMode, setGoalDetailInitialMode] = useState<'detail' | 'edit'>('detail')

  // Kalkulasi dinamis total balance dari goal aktif (exclude archived) & unallocated wallet assets
  const activeGoals = goals.filter((g) => !g.isArchived)
  const totalBalance = activeGoals.reduce((acc, goal) => acc + (goal.currentAmount || 0), 0)
  const totalUnallocated = wallets.reduce((acc, w) => acc + (w.balance || 0), 0)

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

  // --- Wallet Handlers ---
  const handleSaveWallet = (newWallet: Wallet) => {
    setWallets((prev) => {
      // If this is the very first wallet, automatically make it the Main wallet
      const shouldBeMain = prev.length === 0 ? true : Boolean(newWallet.isMain)
      const normalized = shouldBeMain ? { ...newWallet, isMain: true } : newWallet
      return [normalized, ...prev]
    })
    setIsNewWalletSheetOpen(false)
  }

  const handleToggleMainWallet = (targetWallet: Wallet) => {
    const nextIsMain = !targetWallet.isMain
    const now = new Date().toISOString()

    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === targetWallet.id) {
          return { ...w, isMain: nextIsMain, updatedAt: now }
        }
        // Only one wallet can be Main at any time
        if (nextIsMain && w.isMain) {
          return { ...w, isMain: false, updatedAt: now }
        }
        return w
      })
    )

    setSelectedWallet((prev) =>
      prev && prev.id === targetWallet.id
        ? { ...prev, isMain: nextIsMain, updatedAt: now }
        : prev
    )
  }

  const handleOpenWalletDetail = (wallet: Wallet, mode: 'detail' | 'edit' = 'detail') => {
    setSelectedWallet(wallet)
    setWalletDetailInitialMode(mode)
    setIsWalletDetailOpen(true)
  }

  const handleCloseWalletDetail = () => {
    setIsWalletDetailOpen(false)
    setWalletDetailInitialMode('detail')
  }

  const handleUpdateWallet = (updatedWallet: Wallet) => {
    setWallets((prev) =>
      prev.map((w) => (w.id === updatedWallet.id ? updatedWallet : w))
    )
    setSelectedWallet(updatedWallet)
  }

  const handleDeleteWallet = (walletId: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== walletId))
    setIsWalletDetailOpen(false)
  }

  // --- Two-Way Integrated Goal <-> Wallet Mutation ---
  const handleRecordGoalMutation = (
    targetGoal: Goal,
    type: 'deposit' | 'withdraw',
    amount: number,
    note: string,
    selectedWalletId?: string
  ) => {
    const now = new Date().toISOString()
    const targetWallet = selectedWalletId
      ? wallets.find((w) => w.id === selectedWalletId)
      : undefined

    const walletTrxId = targetWallet
      ? `wtrx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      : undefined

    const newGoalTransaction: GoalTransaction = {
      id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      goalId: targetGoal.id,
      type,
      amount,
      note,
      createdAt: now,
      sourceType: targetWallet ? 'wallet' : 'external',
      walletId: targetWallet?.id,
      walletName: targetWallet?.name,
      walletTransactionId: walletTrxId,
    }

    const updatedGoalAmount =
      type === 'deposit'
        ? targetGoal.currentAmount + amount
        : Math.max(0, targetGoal.currentAmount - amount)

    const updatedGoal: Goal = {
      ...targetGoal,
      currentAmount: updatedGoalAmount,
      updatedAt: now,
      transactions: [newGoalTransaction, ...(targetGoal.transactions || [])],
    }

    handleUpdateGoal(updatedGoal)

    if (targetWallet && walletTrxId) {
      const walletTrxType: WalletTransaction['type'] =
        type === 'deposit' ? 'goal_deposit' : 'goal_withdraw'

      const newWalletTransaction: WalletTransaction = {
        id: walletTrxId,
        walletId: targetWallet.id,
        type: walletTrxType,
        amount,
        note: note || (type === 'deposit' ? `Allocated to ${targetGoal.title}` : `Withdrawn from ${targetGoal.title}`),
        relatedGoalId: targetGoal.id,
        relatedGoalTitle: targetGoal.title,
        createdAt: now,
      }

      const updatedWalletBalance =
        type === 'deposit'
          ? Math.max(0, targetWallet.balance - amount)
          : targetWallet.balance + amount

      const updatedWallet: Wallet = {
        ...targetWallet,
        balance: updatedWalletBalance,
        updatedAt: now,
        transactions: [newWalletTransaction, ...(targetWallet.transactions || [])],
      }

      handleUpdateWallet(updatedWallet)
    }
  }

  // --- Two-Way Atomic Revert when deleting a Goal Transaction ---
  const handleDeleteGoalTransaction = (goalId: string, transactionId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const targetTrx = (goal.transactions || []).find((t) => t.id === transactionId)
    if (!targetTrx) return

    const now = new Date().toISOString()

    const revertedCurrentAmount =
      targetTrx.type === 'deposit'
        ? Math.max(0, goal.currentAmount - targetTrx.amount)
        : goal.currentAmount + targetTrx.amount

    const updatedGoal: Goal = {
      ...goal,
      currentAmount: revertedCurrentAmount,
      updatedAt: now,
      transactions: (goal.transactions || []).filter((t) => t.id !== transactionId),
    }

    handleUpdateGoal(updatedGoal)

    // Revert linked wallet balance if sourceType was wallet and wallet still exists
    if (targetTrx.walletId) {
      const linkedWallet = wallets.find((w) => w.id === targetTrx.walletId)
      if (linkedWallet) {
        const revertedWalletBalance =
          targetTrx.type === 'deposit'
            ? linkedWallet.balance + targetTrx.amount
            : Math.max(0, linkedWallet.balance - targetTrx.amount)

        const updatedWallet: Wallet = {
          ...linkedWallet,
          balance: revertedWalletBalance,
          updatedAt: now,
          transactions: targetTrx.walletTransactionId
            ? (linkedWallet.transactions || []).filter((wt) => wt.id !== targetTrx.walletTransactionId)
            : linkedWallet.transactions,
        }

        handleUpdateWallet(updatedWallet)
      }
    }
  }

  // --- Two-Way Atomic Revert when deleting a Wallet Transaction ---
  const handleDeleteWalletTransaction = (walletId: string, walletTransactionId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    if (!wallet) return

    const targetWTrx = (wallet.transactions || []).find((t) => t.id === walletTransactionId)
    if (!targetWTrx) return

    const now = new Date().toISOString()
    const isPositive = targetWTrx.type === 'topup' || targetWTrx.type === 'goal_withdraw'

    const revertedWalletBalance = isPositive
      ? Math.max(0, wallet.balance - targetWTrx.amount)
      : wallet.balance + targetWTrx.amount

    const updatedWallet: Wallet = {
      ...wallet,
      balance: revertedWalletBalance,
      updatedAt: now,
      transactions: (wallet.transactions || []).filter((t) => t.id !== walletTransactionId),
    }

    handleUpdateWallet(updatedWallet)

    // If this wallet transaction was linked to a goal, revert the goal too
    if (targetWTrx.relatedGoalId) {
      const linkedGoal = goals.find((g) => g.id === targetWTrx.relatedGoalId)
      if (linkedGoal) {
        const linkedGoalTrx = (linkedGoal.transactions || []).find(
          (gt) => gt.walletTransactionId === walletTransactionId
        )
        if (linkedGoalTrx) {
          const revertedGoalAmount =
            linkedGoalTrx.type === 'deposit'
              ? Math.max(0, linkedGoal.currentAmount - linkedGoalTrx.amount)
              : linkedGoal.currentAmount + linkedGoalTrx.amount

          const updatedGoal: Goal = {
            ...linkedGoal,
            currentAmount: revertedGoalAmount,
            updatedAt: now,
            transactions: (linkedGoal.transactions || []).filter(
              (gt) => gt.id !== linkedGoalTrx.id
            ),
          }

          handleUpdateGoal(updatedGoal)
        }
      }
    }
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
    handleDeleteGoalTransaction(receiptData.transaction.goalId, transactionId)
    setIsReceiptOpen(false)
  }

  const handlePurgeAccount = () => {
    try {
      localStorage.removeItem('discash_goals')
      localStorage.removeItem('discash_wallets')
    } catch {
      // ignore
    }
    setGoals([])
    setWallets([])
    setSelectedGoal(null)
    setSelectedWallet(null)
    setIsGoalDetailOpen(false)
    setIsWalletDetailOpen(false)
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
                    {/* Header Row: Title + Tactile 3D Wallet Button */}
                    <div className="flex items-center justify-between">
                      <TabHeader title="Dashboard" />

                      <button
                        type="button"
                        onClick={() => setIsWalletPageOpen(true)}
                        className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95] flex items-center justify-center transition-all cursor-pointer shrink-0"
                        title="Open Wallets (Assets)"
                        aria-label="Open Wallets (Assets)"
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
                          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                        </svg>
                      </button>
                    </div>

                    {/* Kartu Total IDR di Paling Atas + Ringkasan Unallocated Wallet Assets */}
                    <TotalBalanceCard
                      totalAmount={totalBalance}
                      label="Total Savings"
                      unallocatedAmount={totalUnallocated}
                      walletCount={wallets.length}
                      onOpenWallets={() => setIsWalletPageOpen(true)}
                    />

                    {/* Total Goals Statistics */}
                    <TotalGoalsCard goals={activeGoals} />

                    {/* Budget Distribution */}
                    <BudgetDistributionCard
                      goals={activeGoals}
                      onSelectGoal={(goal) => handleOpenGoalDetail(goal, 'detail')}
                    />

                    {/* Assets Distribution */}
                    <AssetsDistributionCard
                      wallets={wallets}
                      onSelectWallet={(wallet) => handleOpenWalletDetail(wallet, 'detail')}
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

      {/* Fullscreen Wallets (Unallocated Assets) Page */}
      <WalletPage
        isOpen={isWalletPageOpen}
        wallets={wallets}
        onClose={() => setIsWalletPageOpen(false)}
        onOpenNewWallet={() => setIsNewWalletSheetOpen(true)}
        onSelectWallet={(wallet, mode = 'detail') => handleOpenWalletDetail(wallet, mode)}
        onUpdateWallet={handleUpdateWallet}
        onToggleMainWallet={handleToggleMainWallet}
        onDeleteWallet={handleDeleteWallet}
      />

      {/* New Wallet Creation Bottom Sheet Modal */}
      <NewWalletSheet
        isOpen={isNewWalletSheetOpen}
        onClose={() => setIsNewWalletSheetOpen(false)}
        onSaveWallet={handleSaveWallet}
      />

      {/* Wallet Detail Sheet Modal */}
      <WalletDetailSheet
        isOpen={isWalletDetailOpen}
        wallet={selectedWallet}
        onClose={handleCloseWalletDetail}
        onUpdateWallet={handleUpdateWallet}
        onToggleMainWallet={handleToggleMainWallet}
        onDeleteWallet={handleDeleteWallet}
        onDeleteWalletTransaction={handleDeleteWalletTransaction}
        initialMode={walletDetailInitialMode}
      />

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
        wallets={wallets}
        onClose={handleCloseGoalDetail}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onRecordGoalMutation={handleRecordGoalMutation}
        onDeleteGoalTransaction={handleDeleteGoalTransaction}
        onSelectTransaction={handleOpenReceipt}
        onOpenNewWallet={() => setIsNewWalletSheetOpen(true)}
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
