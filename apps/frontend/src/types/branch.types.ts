export interface Branch {
  id: string
  name: string
  code: string
  address?: string | null
  phone?: string | null
  email?: string | null
  isMain: boolean
  isActive: boolean
  createdAt?: string
}
