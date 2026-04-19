export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  birthday?: string | null
  anniversary?: string | null
  membershipTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  loyaltyPoints: number
  notes?: string
  isActive: boolean
  createdAt: string
}
