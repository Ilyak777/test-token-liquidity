import { redisClient } from '../cache/redisClient';
import { detectLiquidityQueue } from '../queue/queues';

export async function periodicDetectJob(): Promise<void> {
  const tokens = await redisClient.smembers('knownTokens');
  for (const tokenAddress of tokens) {
    const meta = await redisClient.hgetall(`tokenMeta:${tokenAddress}`);
    if (!meta.chainId) continue;

    await detectLiquidityQueue.add(
      { tokenAddress, chainId: meta.chainId },
      { removeOnComplete: true }
    );
  }
}
