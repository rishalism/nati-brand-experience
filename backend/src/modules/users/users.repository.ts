import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Standard include used everywhere a full user (with roles + permissions) is
// needed. Exported type keeps mapping code type-safe.
export const userWithRolesInclude = {
  roles: {
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
    },
  },
} satisfies Prisma.UserInclude;

export type UserWithRoles = Prisma.UserGetPayload<{ include: typeof userWithRolesInclude }>;

/**
 * Data-access layer for users. All persistence logic lives here (repository
 * pattern); the service holds business rules and never touches Prisma directly.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: userWithRolesInclude,
    });
  }

  findById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: userWithRolesInclude,
    });
  }

  create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roleNames: string[];
  }): Promise<UserWithRoles> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: {
          create: data.roleNames.map((name) => ({
            role: { connect: { name } },
          })),
        },
      },
      include: userWithRolesInclude,
    });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithRoles> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: userWithRolesInclude,
    });
  }

  async list(params: {
    skip: number;
    take: number;
    search?: string;
    orderBy: Prisma.UserOrderByWithRelationInput;
  }): Promise<{ items: UserWithRoles[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(params.search
        ? {
            OR: [
              { email: { contains: params.search, mode: 'insensitive' } },
              { firstName: { contains: params.search, mode: 'insensitive' } },
              { lastName: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: userWithRolesInclude,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async setRoles(userId: string, roleNames: string[]): Promise<UserWithRoles> {
    const roles = await this.prisma.role.findMany({
      where: { name: { in: roleNames } },
      select: { id: true },
    });
    // Replace the user's role set atomically.
    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId } }),
      this.prisma.userRole.createMany({
        data: roles.map((r) => ({ userId, roleId: r.id })),
        skipDuplicates: true,
      }),
    ]);
    return this.findById(userId) as Promise<UserWithRoles>;
  }

  softDelete(id: string): Promise<UserWithRoles> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: userWithRolesInclude,
    });
  }
}
