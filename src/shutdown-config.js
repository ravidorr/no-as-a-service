import { parsePositiveInteger } from './rate-limit-config.js';

export const DEFAULT_SHUTDOWN_TIMEOUT_MS = 30_000;
export const MAX_SHUTDOWN_TIMEOUT_MS = 2_147_483_647;

export function validateShutdownConfig(config) {
  if (!Number.isInteger(config.timeoutMs) || config.timeoutMs <= 0) {
    throw new Error('timeoutMs must be a positive integer');
  }

  if (config.timeoutMs > MAX_SHUTDOWN_TIMEOUT_MS) {
    throw new Error(
      `timeoutMs must not exceed ${MAX_SHUTDOWN_TIMEOUT_MS}, the maximum Node.js timer delay`
    );
  }

  return config;
}

export function parseShutdownConfig(env = process.env) {
  return validateShutdownConfig({
    timeoutMs:
      parsePositiveInteger(env.SHUTDOWN_TIMEOUT_MS, 'SHUTDOWN_TIMEOUT_MS') ??
      DEFAULT_SHUTDOWN_TIMEOUT_MS
  });
}
