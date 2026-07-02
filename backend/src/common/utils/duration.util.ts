const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Parses a short duration string (e.g. "15m", "7d", "3600s") into milliseconds.
 * Used to derive absolute expiry dates from the TTL strings in config.
 */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration string: "${value}" (expected e.g. 15m, 7d)`);
  }
  const amount = Number(match[1]);
  const unit = match[2];
  return amount * UNIT_MS[unit];
}

/** Returns a Date `duration` from now. */
export function expiryFromNow(duration: string): Date {
  return new Date(Date.now() + parseDurationMs(duration));
}
