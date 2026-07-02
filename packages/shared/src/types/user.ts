import type { Role } from "../constants/roles";
import type { Permission } from "../constants/permissions";
import type { UserStatus } from "../constants/enums";

/** Safe user projection returned by the API — never includes secrets. */
export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  emailVerified: boolean;
  roles: Role[];
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}
