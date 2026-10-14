export interface WalletTransaction {
  id: string
  walletId: string
  type: 'topup' | 'deduct' | 'goal_deposit' | 'goal_withdraw'
  amount: number
  note: string
  relatedGoalId?: string
  relatedGoalTitle?: string
  createdAt: string
}

export interface Wallet {
  id: string
  name: string
  description?: string
  balance: number
  icon: string
  customPhoto?: string
  isPinned?: boolean
  isMain?: boolean
  createdAt: string
  updatedAt?: string
  transactions?: WalletTransaction[]
}
