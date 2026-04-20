const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Softzeno POS'
export const APP_LOGO_URL =
  process.env.NEXT_PUBLIC_APP_LOGO_URL || `${BASE_PATH}/branding/softzeno-logo.jpeg`
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'

export const BUSINESS_TYPES = [
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'RETAIL', label: 'Retail Store' },
  { value: 'GROCERY', label: 'Grocery / Supermarket' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'CAFE', label: 'Cafe / Coffee Shop' },
  { value: 'BAR', label: 'Bar / Nightclub' },
  { value: 'SALON', label: 'Salon / Spa' },
  { value: 'OTHER', label: 'Other' },
] as const

export const ORDER_TYPES = [
  { value: 'DINE_IN', label: 'Dine In' },
  { value: 'TAKEAWAY', label: 'Takeaway' },
  { value: 'DELIVERY', label: 'Delivery' },
] as const

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'MOBILE', label: 'Mobile Payment' },
  { value: 'SPLIT', label: 'Split Payment' },
] as const

export const TABLE_STATUSES = {
  AVAILABLE: { label: 'Available', color: 'bg-green-100 text-green-800' },
  OCCUPIED: { label: 'Occupied', color: 'bg-red-100 text-red-800' },
  RESERVED: { label: 'Reserved', color: 'bg-yellow-100 text-yellow-800' },
  CLEANING: { label: 'Cleaning', color: 'bg-blue-100 text-blue-800' },
} as const

export const KITCHEN_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 border-yellow-400' },
  PREPARING: { label: 'Preparing', color: 'bg-blue-100 border-blue-400' },
  READY: { label: 'Ready', color: 'bg-green-100 border-green-400' },
  DELIVERED: { label: 'Delivered', color: 'bg-gray-100 border-gray-400' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 border-red-400' },
} as const

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  POS: '/pos',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  INVENTORY: '/inventory',
  CUSTOMERS: '/customers',
  ORDERS: '/orders',
  SALES: '/sales',
  EMPLOYEES: '/employees',
  SUPPLIERS: '/suppliers',
  PURCHASES: '/purchases',
  EXPENSES: '/expenses',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  BRANCHES: '/branches',
  TABLES: '/restaurant/tables',
  KITCHEN: '/restaurant/kitchen',
  AUDIT: '/audit',
} as const
