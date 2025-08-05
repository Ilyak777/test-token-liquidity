import Queue from 'bull';
import { config } from '../config';

export type FetchJobData = Record<string, never>;

export interface DetectJobData {
  chainId: string;
  tokenAddress: string;
}
export interface NotificationData {
  url: string;
  prev: number;
  current: number;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
}


export const fetchNewTokensQueue   = new Queue<FetchJobData>('fetchNewTokens',   { redis: config.REDIS_URL });
export const detectLiquidityQueue = new Queue<DetectJobData>('detectLiquidity', { redis: config.REDIS_URL });
export const notificationQueue    = new Queue<NotificationData>('notifications',  { redis: config.REDIS_URL });
