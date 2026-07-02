import { Injectable, NotFoundException } from '@nestjs/common';
import { ROLES, type PublicUser, type Role, type Permission, type UserStatus } from '@nati/shared';
import type { PaginatedData } from '@nati/shared';
import { paginate } from '../../common/utils/pagination.util';
import { UsersRepository, type UserWithRoles } from './users.repository';

/** Business logic for users. Controllers and other services depend on this;
 * it maps persistence entities to the safe `PublicUser` projection. */
@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  /** Flattens a user + its role/permission graph into the API-safe shape. */
  toPublicUser(user: UserWithRoles): PublicUser {
    const roles = user.roles.map((ur) => ur.role.name as Role);
    const permissions = [
      ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name))),
    ] as Permission[];

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      emailVerified: user.emailVerified,
      roles,
      permissions,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  findByEmail(email: string): Promise<UserWithRoles | null> {
    return this.repo.findByEmail(email);
  }

  findEntityById(id: string): Promise<UserWithRoles | null> {
    return this.repo.findById(id);
  }

  async getPublicUser(id: string): Promise<PublicUser> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublicUser(user);
  }

  async createCustomer(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<UserWithRoles> {
    return this.repo.create({ ...data, roleNames: [ROLES.CUSTOMER] });
  }

  async updateProfile(
    id: string,
    data: { firstName?: string; lastName?: string },
  ): Promise<PublicUser> {
    const user = await this.repo.update(id, data);
    return this.toPublicUser(user);
  }

  async markEmailVerified(id: string): Promise<void> {
    await this.repo.update(id, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: 'ACTIVE',
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.repo.update(id, { passwordHash });
  }

  async recordLogin(id: string): Promise<void> {
    await this.repo.update(id, { lastLoginAt: new Date() });
  }

  // --- Admin operations ---

  async list(params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<PaginatedData<PublicUser>> {
    const sortField = params.sortBy ?? 'createdAt';
    const { items, total } = await this.repo.list({
      skip: params.skip,
      take: params.limit,
      search: params.search,
      orderBy: { [sortField]: params.sortOrder },
    });
    return paginate(
      items.map((u) => this.toPublicUser(u)),
      { page: params.page, limit: params.limit, total },
    );
  }

  async updateStatus(id: string, status: UserStatus): Promise<PublicUser> {
    const user = await this.repo.update(id, { status });
    return this.toPublicUser(user);
  }

  async setRoles(id: string, roleNames: Role[]): Promise<PublicUser> {
    const user = await this.repo.setRoles(id, roleNames);
    return this.toPublicUser(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
