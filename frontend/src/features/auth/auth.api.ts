import type {
  ApiResponse,
  AuthSession,
  LoginInput,
  PublicUser,
  RegisterInput,
} from "@nati/shared";
import { apiClient, unwrap } from "@/services/api-client";
import { useAuthStore } from "./auth.store";

/**
 * Auth API layer. Wraps the backend endpoints and keeps the Zustand store in
 * sync (single place that mutates auth state from network results). Components
 * call these; the store stays free of network concerns (no import cycle with
 * the api-client).
 */

async function login(input: LoginInput): Promise<PublicUser> {
  const session = await unwrap<AuthSession>(
    apiClient.post<ApiResponse<AuthSession>>("/auth/login", input),
  );
  useAuthStore.getState().setUser(session.user);
  return session.user;
}

async function register(input: RegisterInput): Promise<PublicUser> {
  const session = await unwrap<AuthSession>(
    apiClient.post<ApiResponse<AuthSession>>("/auth/register", input),
  );
  useAuthStore.getState().setUser(session.user);
  return session.user;
}

async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    useAuthStore.getState().clear();
  }
}

/** Rehydrates the session on app load. `/auth/me` (with the api-client refresh
 * interceptor) transparently renews an expired access token; only a hard
 * failure lands the user in the unauthenticated state. */
async function loadSession(): Promise<void> {
  const store = useAuthStore.getState();
  store.setStatus("loading");
  try {
    const user = await unwrap<PublicUser>(apiClient.get<ApiResponse<PublicUser>>("/auth/me"));
    store.setUser(user);
  } catch {
    store.clear();
  }
}

async function verifyEmail(token: string): Promise<void> {
  await apiClient.post("/auth/verify-email", { token });
}

async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

async function resetPassword(token: string, password: string): Promise<void> {
  await apiClient.post("/auth/reset-password", { token, password });
}

async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/change-password", { currentPassword, newPassword });
}

/** Updates the profile (name) and keeps the store's user in sync. */
async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
}): Promise<PublicUser> {
  const user = await unwrap<PublicUser>(
    apiClient.patch<ApiResponse<PublicUser>>("/users/me", input),
  );
  useAuthStore.getState().setUser(user);
  return user;
}

export const authApi = {
  login,
  register,
  logout,
  loadSession,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
};
