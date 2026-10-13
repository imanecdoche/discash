export interface GoalTransaction {
  id: string
  goalId: string
  type: 'deposit' | 'withdraw'
  amount: number
  note: string
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  icon: string
  customPhoto?: string
  isPinned?: boolean
  isArchived?: boolean
  createdAt: string
  updatedAt?: string
  transactions?: GoalTransaction[]
}
