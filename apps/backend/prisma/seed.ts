import { PrismaClient, BusinessType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (dev only)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.$executeRaw`SET session_replication_role = replica`;
    const tables = [
      'Notification', 'AuditLog', 'Setting', 'Subscription', 'Attendance', 'Employee',
      'Expense', 'KitchenTicket', 'RestaurantOrderItem', 'RestaurantOrder', 'Table',
      'LoyaltyTransaction', 'CouponUsage', 'Coupon', 'Refund', 'Payment', 'SaleItem',
      'Sale', 'Shift', 'Register', 'PurchaseOrderItem', 'PurchaseOrder', 'Supplier',
      'StockTransfer', 'StockMovement', 'Inventory', 'ProductIngredient', 'ProductVariant',
      'Product', 'TaxClass', 'Unit', 'Brand', 'Category', 'Customer', 'UserBranchAccess',
      'User', 'Permission', 'Role', 'Branch', 'Tenant',
    ];
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`).catch(() => {});
    }
    await prisma.$executeRaw`SET session_replication_role = DEFAULT`;
  }

  // Create Super Admin Tenant (Platform)
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@softzeno.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';

  const platformTenant = await prisma.tenant.create({
    data: {
      name: 'Softzeno Tech',
      slug: 'softzeno',
      email: 'platform@softzeno.com',
      businessType: BusinessType.GENERAL,
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    },
  });

  const platformBranch = await prisma.branch.create({
    data: {
      tenantId: platformTenant.id,
      name: 'HQ',
      code: 'HQ',
      isMain: true,
    },
  });

  const superAdminHash = await bcrypt.hash(superAdminPassword, 12);
  await prisma.user.create({
    data: {
      tenantId: platformTenant.id,
      branchId: platformBranch.id,
      name: 'Super Admin',
      email: superAdminEmail,
      passwordHash: superAdminHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Super Admin created: ${superAdminEmail} / ${superAdminPassword}`);

  // Create Demo Tenant
  const demoTenant = await prisma.tenant.create({
    data: {
      name: 'Demo Restaurant',
      slug: 'demo-restaurant',
      email: 'owner@demo-restaurant.com',
      businessType: BusinessType.RESTAURANT,
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    },
  });

  const demoBranch = await prisma.branch.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Main Branch',
      code: 'MAIN',
      isMain: true,
      address: '123 Food Street, Demo City',
      phone: '+1-555-0100',
      email: 'main@demo-restaurant.com',
    },
  });

  // Demo Owner
  const ownerHash = await bcrypt.hash('Owner@123456', 12);
  await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      branchId: demoBranch.id,
      name: 'Restaurant Owner',
      email: 'owner@demo-restaurant.com',
      passwordHash: ownerHash,
      role: UserRole.TENANT_OWNER,
      isActive: true,
    },
  });

  // Demo Manager
  const managerHash = await bcrypt.hash('Manager@123456', 12);
  await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      branchId: demoBranch.id,
      name: 'Demo Manager',
      email: 'manager@demo-restaurant.com',
      passwordHash: managerHash,
      role: UserRole.MANAGER,
      isActive: true,
    },
  });

  // Demo Cashier
  const cashierHash = await bcrypt.hash('Cashier@123456', 12);
  await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      branchId: demoBranch.id,
      name: 'Demo Cashier',
      email: 'cashier@demo-restaurant.com',
      passwordHash: cashierHash,
      role: UserRole.CASHIER,
      isActive: true,
    },
  });

  console.log(`✅ Demo tenant created: demo-restaurant`);

  // Tax Classes
  const taxClass = await prisma.taxClass.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Standard (10%)',
      rate: 10,
      isDefault: true,
    },
  });

  // Units
  const pieceUnit = await prisma.unit.create({
    data: { tenantId: demoTenant.id, name: 'Piece', abbreviation: 'pc' },
  });
  const kgUnit = await prisma.unit.create({
    data: { tenantId: demoTenant.id, name: 'Kilogram', abbreviation: 'kg' },
  });

  // Categories
  const foodCategory = await prisma.category.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Food',
      slug: 'food',
      sortOrder: 1,
    },
  });

  const beverageCategory = await prisma.category.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Beverages',
      slug: 'beverages',
      sortOrder: 2,
    },
  });

  const mainCourseCategory = await prisma.category.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Main Course',
      slug: 'main-course',
      parentId: foodCategory.id,
      sortOrder: 1,
    },
  });

  // Products
  const burger = await prisma.product.create({
    data: {
      tenantId: demoTenant.id,
      categoryId: mainCourseCategory.id,
      unitId: pieceUnit.id,
      taxClassId: taxClass.id,
      name: 'Classic Burger',
      slug: 'classic-burger',
      description: 'Juicy beef patty with fresh vegetables',
      barcode: '1000000001',
      sku: 'BRGR-001',
      costPrice: 4.50,
      sellingPrice: 12.99,
      isActive: true,
      isRestaurantItem: true,
      trackStock: true,
    },
  });

  const pizza = await prisma.product.create({
    data: {
      tenantId: demoTenant.id,
      categoryId: mainCourseCategory.id,
      unitId: pieceUnit.id,
      taxClassId: taxClass.id,
      name: 'Margherita Pizza',
      slug: 'margherita-pizza',
      description: 'Classic tomato and mozzarella pizza',
      barcode: '1000000002',
      sku: 'PIZZA-001',
      costPrice: 5.00,
      sellingPrice: 15.99,
      isActive: true,
      isRestaurantItem: true,
      trackStock: true,
    },
  });

  const coffee = await prisma.product.create({
    data: {
      tenantId: demoTenant.id,
      categoryId: beverageCategory.id,
      unitId: pieceUnit.id,
      taxClassId: taxClass.id,
      name: 'Espresso',
      slug: 'espresso',
      description: 'Strong Italian coffee',
      barcode: '1000000003',
      sku: 'CAFE-001',
      costPrice: 0.80,
      sellingPrice: 3.50,
      isActive: true,
      isRestaurantItem: true,
      trackStock: false,
    },
  });

  // Inventory
  await prisma.inventory.createMany({
    data: [
      {
        tenantId: demoTenant.id,
        branchId: demoBranch.id,
        productId: burger.id,
        quantity: 50,
        reservedQty: 0,
        reorderLevel: 10,
        maxLevel: 100,
      },
      {
        tenantId: demoTenant.id,
        branchId: demoBranch.id,
        productId: pizza.id,
        quantity: 30,
        reservedQty: 0,
        reorderLevel: 5,
        maxLevel: 50,
      },
    ],
  });

  // Tables
  const tableNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'B1', 'B2'];
  for (const tableName of tableNames) {
    await prisma.table.create({
      data: {
        tenantId: demoTenant.id,
        branchId: demoBranch.id,
        name: tableName,
        capacity: tableName.startsWith('B') ? 6 : 4,
        section: tableName.startsWith('B') ? 'Bar' : 'Main Hall',
        status: 'AVAILABLE',
      },
    });
  }

  // Register
  await prisma.register.create({
    data: {
      tenantId: demoTenant.id,
      branchId: demoBranch.id,
      name: 'Main Register',
      isActive: true,
    },
  });

  // Demo Coupon
  await prisma.coupon.create({
    data: {
      tenantId: demoTenant.id,
      code: 'WELCOME10',
      name: 'Welcome 10% Off',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 20,
      usageLimit: 100,
      isActive: true,
    },
  });

  // Demo Customer
  await prisma.customer.create({
    data: {
      tenantId: demoTenant.id,
      branchId: demoBranch.id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      membershipTier: 'GOLD',
      loyaltyPoints: 500,
    },
  });

  // Subscription
  await prisma.subscription.create({
    data: {
      tenantId: demoTenant.id,
      plan: 'professional',
      status: 'ACTIVE',
      monthlyPrice: 49.99,
      billingCycle: 'monthly',
      startDate: new Date(),
      features: {
        maxBranches: 5,
        maxUsers: 20,
        restaurantModule: true,
        inventoryModule: true,
        reportsModule: true,
        loyaltyModule: true,
      },
    },
  });

  // Default settings
  const defaultSettings = [
    { key: 'currency', value: 'USD', group: 'general' },
    { key: 'currency_symbol', value: '$', group: 'general' },
    { key: 'timezone', value: 'America/New_York', group: 'general' },
    { key: 'receipt_footer', value: 'Thank you for dining with us!', group: 'receipt' },
    { key: 'loyalty_points_per_dollar', value: '1', group: 'loyalty' },
    { key: 'loyalty_points_value', value: '0.01', group: 'loyalty' },
    { key: 'tax_inclusive', value: 'false', group: 'tax' },
    { key: 'service_charge_rate', value: '5', group: 'billing' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.create({
      data: { tenantId: demoTenant.id, ...setting },
    });
  }

  console.log('✅ Demo data created successfully');
  console.log('\n📋 Login Credentials:');
  console.log(`   Super Admin: ${superAdminEmail} / ${superAdminPassword}`);
  console.log(`   Restaurant Owner: owner@demo-restaurant.com / Owner@123456`);
  console.log(`   Manager: manager@demo-restaurant.com / Manager@123456`);
  console.log(`   Cashier: cashier@demo-restaurant.com / Cashier@123456`);
  console.log('\n🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
