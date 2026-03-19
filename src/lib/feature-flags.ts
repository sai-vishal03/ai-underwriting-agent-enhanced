/**
 * Feature Flags — Environment-based toggle system.
 * 
 * Usage:
 *   import { flags } from '@/lib/feature-flags';
 *   if (flags.isEnabled('ENABLE_RISK_AI_V2')) { ... }
 * 
 * Set in .env:
 *   ENABLE_RISK_AI_V2=true
 *   ENABLE_SETTLEMENT_CRON=true
 *   ENABLE_STRICT_VALIDATION=false
 * 
 * ARCHITECTURE NOTE (Interview talking point):
 *   This is a simple env-based flag system. In production, upgrade to:
 *   - LaunchDarkly / Flagsmith / Unleash for remote toggle management
 *   - Percentage-based rollouts, A/B testing, user segment targeting
 */

type FlagName =
  | 'ENABLE_RISK_AI_V2'
  | 'ENABLE_SETTLEMENT_CRON'
  | 'ENABLE_STRICT_VALIDATION';

const FLAG_DEFAULTS: Record<FlagName, boolean> = {
  ENABLE_RISK_AI_V2: true,
  ENABLE_SETTLEMENT_CRON: true,
  ENABLE_STRICT_VALIDATION: true,
};

class FeatureFlags {
  /**
   * Check if a feature flag is enabled.
   * Falls back to default if env var is not set.
   */
  isEnabled(flag: FlagName): boolean {
    const envValue = process.env[flag];
    if (envValue === undefined || envValue === '') {
      return FLAG_DEFAULTS[flag];
    }
    return envValue === 'true' || envValue === '1';
  }

  /**
   * Get all flag states — useful for debugging and /api/metrics.
   */
  getAll(): Record<FlagName, boolean> {
    const result = {} as Record<FlagName, boolean>;
    for (const flag of Object.keys(FLAG_DEFAULTS) as FlagName[]) {
      result[flag] = this.isEnabled(flag);
    }
    return result;
  }
}

export const flags = new FeatureFlags();
