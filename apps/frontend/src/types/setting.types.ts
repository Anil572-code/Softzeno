export interface Setting {
  id: string
  key: string
  value: string
  group?: string | null
  branchId?: string | null
  createdAt?: string
}
