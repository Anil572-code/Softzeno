# Softzeno POS - API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication
All protected endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new tenant & owner |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET  | `/auth/profile` | Get current user profile |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/change-password` | Change password |

### Tenants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tenants/me` | Get current tenant |
| PUT | `/tenants/me` | Update current tenant |
| GET | `/tenants/me/stats` | Get tenant statistics |

### Branches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/branches` | List branches |
| POST | `/branches` | Create branch |
| GET | `/branches/:id` | Get branch |
| PUT | `/branches/:id` | Update branch |
| DELETE | `/branches/:id` | Delete branch |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products |
| POST | `/products` | Create product |
| GET | `/products/:id` | Get product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/products/barcode/:barcode` | Search by barcode |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| GET | `/categories/:id` | Get category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory/:branchId/stock` | Get stock levels |
| GET | `/inventory/:branchId/low-stock` | Get low stock items |
| POST | `/inventory/:branchId/adjust` | Adjust stock |
| POST | `/inventory/transfer` | Transfer stock between branches |
| GET | `/inventory/:branchId/history/:productId` | Stock movement history |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| POST | `/customers/:id/loyalty/adjust` | Adjust loyalty points |

### Sales (POS)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sales` | Create sale / POS transaction |
| GET | `/sales` | List sales |
| GET | `/sales/held` | Get on-hold sales |
| GET | `/sales/:id` | Get sale details |
| POST | `/sales/:id/void` | Void a sale |
| POST | `/sales/:id/refund` | Refund a sale |
| POST | `/sales/:id/hold` | Hold a sale |
| POST | `/sales/:id/resume` | Resume a held sale |

### Restaurant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/restaurant/tables` | Create table |
| GET | `/restaurant/tables` | Get all tables with status |
| PUT | `/restaurant/tables/:id` | Update table |
| DELETE | `/restaurant/tables/:id` | Delete table |
| POST | `/restaurant/orders` | Create restaurant order (KOT) |
| GET | `/restaurant/orders` | List orders |
| GET | `/restaurant/orders/:id` | Get order |
| PATCH | `/restaurant/orders/:id/status` | Update order status |
| POST | `/restaurant/orders/:id/items` | Add items to order |
| GET | `/restaurant/kitchen/tickets` | Get kitchen tickets |
| PATCH | `/restaurant/kitchen/tickets/:id/status` | Update ticket status |

### Suppliers & Purchases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/suppliers` | List suppliers |
| POST | `/suppliers` | Create supplier |
| GET | `/suppliers/:id` | Get supplier |
| PUT | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Delete supplier |
| POST | `/suppliers/purchase-orders` | Create purchase order |
| GET | `/suppliers/purchase-orders/all` | List purchase orders |
| GET | `/suppliers/purchase-orders/:id` | Get purchase order |
| POST | `/suppliers/purchase-orders/:id/receive` | Receive items |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/dashboard` | Get dashboard data |
| GET | `/reports/daily?date=YYYY-MM-DD` | Daily sales report |
| GET | `/reports/sales?startDate=&endDate=&groupBy=` | Sales report |
| GET | `/reports/products?startDate=&endDate=` | Product performance |
| GET | `/reports/staff?startDate=&endDate=` | Staff performance |
| GET | `/reports/branches?startDate=&endDate=` | Branch comparison |

### Coupons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/coupons` | List coupons |
| POST | `/coupons` | Create coupon |
| POST | `/coupons/validate` | Validate coupon code |
| GET | `/coupons/:id` | Get coupon |
| PUT | `/coupons/:id` | Update coupon |
| DELETE | `/coupons/:id` | Delete coupon |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get all settings |
| POST | `/settings` | Set a setting |
| POST | `/settings/bulk` | Set multiple settings |
| GET | `/settings/:key` | Get specific setting |
| DELETE | `/settings/:key` | Delete setting |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List expenses |
| POST | `/expenses` | Create expense |
| GET | `/expenses/:id` | Get expense |
| PUT | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | List employees |
| POST | `/employees` | Create employee |
| GET | `/employees/:id` | Get employee |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Terminate employee |
| POST | `/employees/attendance` | Record attendance |

### Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit` | Get audit logs |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get notifications |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |
