import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { ALL_PERMISSIONS, PERMISSIONS, ROLES, type Permission, type Role } from '@nati/shared';

const prisma = new PrismaClient();

// Which permissions each role gets. SUPER_ADMIN implicitly gets everything.
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_WRITE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.CATEGORY_MANAGE,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_MANAGE,
    PERMISSIONS.COUPON_MANAGE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REVIEW_MODERATE,
  ],
  [ROLES.CUSTOMER]: [PERMISSIONS.PRODUCT_READ, PERMISSIONS.ORDER_READ],
};

async function main(): Promise<void> {
  // 1. Permissions
  await Promise.all(
    ALL_PERMISSIONS.map((name) =>
      prisma.permission.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  // 2. Roles + their permission grants
  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS) as [
    Role,
    Permission[],
  ][]) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const permRecords = await prisma.permission.findMany({
      where: { name: { in: permissions } },
      select: { id: true },
    });

    await Promise.all(
      permRecords.map((p) =>
        prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
          update: {},
          create: { roleId: role.id, permissionId: p.id },
        }),
      ),
    );
  }

  // 3. Bootstrap super admin (dev credentials — change in real environments)
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@nati.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const passwordHash = await argon2.hash(adminPassword, { type: argon2.argon2id });

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: ROLES.SUPER_ADMIN },
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'NATI',
      lastName: 'Admin',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: superAdminRole.id },
  });

  await seedCatalog();

  console.log(`Seed complete. Super admin: ${adminEmail}`);
}

// Seeds the NATI brand/category and the original storefront products with stock.
async function seedCatalog(): Promise<void> {
  const brand = await prisma.brand.upsert({
    where: { slug: 'nati' },
    update: {},
    create: { name: 'NATI', slug: 'nati', description: 'Premium electrolyte hydration.' },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'electrolytes' },
    update: {},
    create: { name: 'Electrolytes', slug: 'electrolytes' },
  });

  const products = [
    {
      slug: 'nati-single-pack',
      name: 'NATI Single Pack',
      description: 'Perfect for trying out. 10 sachets of pure electrolyte power.',
      price: 29.99,
      compareAtPrice: 39.99,
      isFeatured: false,
      stock: 200,
    },
    {
      slug: 'nati-bundle',
      name: 'NATI Bundle',
      description: 'Best value. 30 sachets for the committed athlete.',
      price: 69.99,
      compareAtPrice: 99.99,
      isFeatured: true,
      stock: 150,
    },
    {
      slug: 'nati-monthly',
      name: 'NATI Monthly',
      description: 'Never run out. 30 sachets delivered monthly.',
      price: 59.99,
      compareAtPrice: null,
      isFeatured: false,
      stock: 100,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        currency: 'USD',
        status: 'ACTIVE',
        isFeatured: p.isFeatured,
        brandId: brand.id,
        categoryId: category.id,
        inventory: { create: { quantity: p.stock, lowStockThreshold: 20 } },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
