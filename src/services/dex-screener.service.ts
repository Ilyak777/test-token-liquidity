import axios from 'axios';
import { redisClient } from '../cache/redisClient';
import { config } from '../config';
import { poolsLimiter, profilesLimiter, searchLimiter } from '../utils/limiter';

export interface TokenProfile {
  tokenAddress: string;
  chainId: string;
}

export interface PairLiquidity {
  pairAddress: string;
  chainId: string;
  liquidity: { usd: number };
}

export interface TokenPool {
  chainId: string;
  pairAddress: string;
  url: string;
  liquidity: { usd: number; base: number; quote: number };
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

const PROFILES_CACHE_KEY = 'tokenProfiles';
const CACHE_KEY_PREFIX   = 'liquidity:';

export async function getLatestTokenProfiles(): Promise<TokenProfile[]> {
  const cache = await redisClient.get(PROFILES_CACHE_KEY);
  if (cache) return JSON.parse(cache);

  const resp = await profilesLimiter.schedule(() =>
    axios.get<{ data: TokenProfile[] }>(`${config.API_BASE_URL}/token-profiles/latest/v1`)
  );
  const profiles = resp.data;
  if (!profiles || !Array.isArray(profiles)) {
    throw new Error('Invalid response from API');
  }
  await redisClient.setex(PROFILES_CACHE_KEY, config.CACHE_TTL, JSON.stringify(profiles));
  return profiles;
}

export async function getLiquidityByToken(tokenAddress: string, chainId: string): Promise<PairLiquidity> {
  const cacheKey = `${CACHE_KEY_PREFIX}${tokenAddress}`;
  const cache = await redisClient.get(cacheKey);
  if (cache) return JSON.parse(cache);

  const resp = await searchLimiter.schedule(() =>
    axios.get<{ pairs: PairLiquidity[] }>(
      `${config.API_BASE_URL}/token-pairs/v1/${chainId}/${tokenAddress}`
    )
  );
  const found = resp.data.pairs.find(p => p.pairAddress.toLowerCase() === tokenAddress.toLowerCase())
              || resp.data.pairs[0];

  await redisClient.setex(cacheKey, config.CACHE_TTL, JSON.stringify(found));
  return found;
}

export async function getTokenPools(
  chainId: string,
  tokenAddress: string
): Promise<TokenPool[]> {
  const endpoint = `${config.API_BASE_URL}/token-pairs/v1/${chainId}/${tokenAddress}`;
  const resp = await poolsLimiter.schedule(() =>
    axios.get<TokenPool[]>(endpoint)
  );
  return resp.data;
}
