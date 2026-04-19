export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  loyaltyPoints: number
  totalSpent: number
  visitCount: number
  notes?: string
  isActive: boolean
  createdAt: string
}
