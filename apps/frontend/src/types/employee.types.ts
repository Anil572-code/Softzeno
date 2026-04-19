export interface Employee {
  id: string
  employeeCode: string
  position?: string | null
  department?: string | null
  salary?: number | null
  commissionRate?: number | null
  hireDate?: string | null
  terminationDate?: string | null
  isActive: boolean
  user: { id: string; name: string; email?: string | null; phone?: string | null; role?: string }
  branch: { id: string; name: string }
  createdAt?: string
}

export interface Attendance {
  id: string
  date: string
  checkIn?: string | null
  checkOut?: string | null
  workHours?: number | null
  notes?: string | null
}
