export type ExpenseCategory = 'RENT' | 'UTILITIES' | 'SALARY' | 'SUPPLIES' | 'MAINTENANCE' | 'MARKETING' | 'OTHER'

export interface Expense {
  id: string
  category: ExpenseCategory
  title: string
  amount: number
  description?: string | null
  receiptUrl?: string | null
  expenseDate: string
  branch: { id: string; name: string }
  user: { id: string; name: string }
  createdAt?: string
}
