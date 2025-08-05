import { getLatestTokenProfiles } from '../services/dex-screener.service';
import { config } from '../config';
import { redisClient } from '../cache/redisClient';
import { DetectJobData } from '../queue/queues';
import { detectLiquidityJob } from './detectLiquidityJob';

export async function fetchNewTokensJob(): Promise<void> {
  const profiles = await getLatestTokenProfiles();
  const known = await redisClient.smembers('knownTokens');
  for (const p of profiles) {
    if (config.ALLOWED_CHAINS.includes(p.chainId) && !known.includes(p.tokenAddress)) {
      await redisClient.sadd('knownTokens', p.tokenAddress);
      await redisClient.hset(
        `tokenMeta:${p.tokenAddress}`,
        'chainId', p.chainId,
        'tokenAddress', p.tokenAddress
      );
      const jobData: DetectJobData = { tokenAddress: p.tokenAddress, chainId: p.chainId };
      await detectLiquidityJob(jobData);
      console.log(`Added new token to detectLiquidity: ${p.tokenAddress} on chain ${p.chainId}`);
    }
  }
}
