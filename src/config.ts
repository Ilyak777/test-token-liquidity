export interface Config {
  API_BASE_URL: string;
  CACHE_TTL: number;
  LIQUIDITY_THRESHOLD: number;
  REDIS_URL: string;
  WEBHOOK_URL: string;
  ALLOWED_CHAINS: string[];
}

export const config: Config = {
  API_BASE_URL: 'https://api.dexscreener.com',
  CACHE_TTL: 60,
  LIQUIDITY_THRESHOLD: 1.05,
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  WEBHOOK_URL: process.env.WEBHOOK_URL || 'https://example.com/your-webhook',
  ALLOWED_CHAINS: ['ethereum', 'solana'],
};
