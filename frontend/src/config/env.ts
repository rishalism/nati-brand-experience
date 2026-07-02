/**
 * Typed, centralized access to Vite env vars. Import from here instead of
 * reading `import.meta.env` scattered across the app.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
