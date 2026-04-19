// Shared types and interfaces for Softzeno POS

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface PaginationMeta {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type UserRoleType =
  | 'SUPER_ADMIN'
  | 'TENANT_OWNER'
  | 'MANAGER'
  | 'CASHIER'
  | 'WAITER'
  | 'KITCHEN_STAFF'
  | 'INVENTORY_MANAGER'
  | 'ACCOUNTANT';

export type BusinessTypeType =
  | 'RESTAURANT'
  | 'CAFE'
  | 'RETAIL'
  | 'GROCERY'
  | 'CLOTHING'
  | 'ELECTRONICS'
  | 'PHARMACY'
  | 'BOOKSTORE'
  | 'MALL'
  | 'GENERAL';

export type OrderStatusType =
  | 'PENDING'
  | 'PLACED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'BILLED'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethodType = 'CASH' | 'CARD' | 'QR' | 'WALLET' | 'SPLIT' | 'CREDIT';
