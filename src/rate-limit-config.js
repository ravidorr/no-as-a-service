export const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const DEFAULT_RATE_LIMIT_MAX = 100;

export function parsePositiveInteger(value, name) {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

export function validateRateLimitConfig(config) {
  if (!Number.isInteger(config.windowMs) || config.windowMs <= 0) {
    throw new Error('windowMs must be a positive integer');
  }

  if (!Number.isInteger(config.max) || config.max <= 0) {
    throw new Error('max must be a positive integer');
  }

  return config;
}

export function parseRateLimitConfig(env = process.env) {
  return validateRateLimitConfig({
    windowMs:
      parsePositiveInteger(env.RATE_LIMIT_WINDOW_MS, 'RATE_LIMIT_WINDOW_MS') ??
      DEFAULT_RATE_LIMIT_WINDOW_MS,
    max:
      parsePositiveInteger(env.RATE_LIMIT_MAX, 'RATE_LIMIT_MAX') ??
      DEFAULT_RATE_LIMIT_MAX
  });
}
