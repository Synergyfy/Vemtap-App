import { IS_PRODUCTION } from '@constants/config';

/**
 * Certificate pinning configuration.
 *
 * When you enable pinning, prefer a pinning-aware transport for sensitive
 * routes (auth + payments). Options for React Native:
 *
 * 1. axios-adapter with native SSL pinning (rn-ssl-pinning / OkHttp+URLSession)
 * 2. Custom fetch interceptor via `react-native-ssl-pinning`
 *
 * Until backend pins are issued, keep `enabled` false — axios uses system TLS.
 */
export interface SslPinningConfig {
  enabled: boolean;
  /** sha256/<base64> fingerprints, include backups for rotation. */
  pins: string[];
  includeSubdomains: boolean;
  maxAgeDays: number;
}

export const sslPinningConfig: SslPinningConfig = {
  // Flip to true once production certs are pinned and rotation is planned.
  enabled: false,
  pins: [
    // 'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  ],
  includeSubdomains: true,
  maxAgeDays: 90,
};

export function shouldPinHost(url: string): boolean {
  if (!sslPinningConfig.enabled || IS_PRODUCTION === false) {
    // Only pin production traffic by default.
    return false;
  }
  try {
    const host = new URL(url).hostname;
    return host.endsWith('vemtap.com');
  } catch {
    return false;
  }
}
