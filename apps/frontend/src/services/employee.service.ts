import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { Employee, Attendance } from '@/types/employee.types'

export const employeeService = {
  getEmployees: (params?: { page?: number; limit?: number; search?: string; branchId?: string }) =>
    api.get<PaginatedResponse<Employee>>('/employees', { params }).then(r => r.data),
  getEmployee: (id: string) => api.get<Employee>(`/employees/${id}`).then(r => r.data),
  createEmployee: (data: {
    userId: string
    branchId: string
    employeeCode: string
    position?: string
    department?: string
    salary?: number
    commissionRate?: number
    hireDate?: string
  }) => api.post<Employee>('/employees', data).then(r => r.data),
  updateEmployee: (id: string, data: Partial<Employee> & { terminationDate?: string }) =>
    api.put<Employee>(`/employees/${id}`, data).then(r => r.data),
  deleteEmployee: (id: string) => api.delete(`/employees/${id}`).then(r => r.data),
  recordAttendance: (data: { employeeId: string; checkIn?: string; checkOut?: string; notes?: string }) =>
    api.post<Attendance>('/employees/attendance', data).then(r => r.data),
}
