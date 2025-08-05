import { DetectJobData, detectLiquidityQueue, notificationQueue } from './queues';
import { redisClient } from '../cache/redisClient';
import { getTokenPools } from '../services/dex-screener.service';
import { config } from '../config';

detectLiquidityQueue.process(async job => {
  const { chainId, tokenAddress } = job.data as DetectJobData;

  try {
    const pools = await getTokenPools(chainId, tokenAddress);

    for (const pool of pools) {
      if(!pool.liquidity || !pool.liquidity.usd) {
        // здесь я бы поресерчил процесс добавления ликвидности в пул, то есть через сколько времени она появится - и делал бы re-request
        console.warn(`Skipping pool ${JSON.stringify(pool)} due to missing liquidity data`);
        continue;
      }
      const {
        pairAddress,
        url,
        liquidity: { usd: current },
        baseToken,
        quoteToken
      } = pool;
      const key = `liquidity:${chainId}:${pairAddress}`;
      const prevValue = await redisClient.get(key);
      const prev = prevValue ? parseFloat(prevValue) : null;

      await redisClient.set(key, current.toString());
      if (prev !== null && current / prev >= config.LIQUIDITY_THRESHOLD) {
        await notificationQueue.add(
          {
            url,
            prev,
            current,
            baseToken: {
              address: baseToken.address,
              name: baseToken.name,
              symbol: baseToken.symbol
            },
            quoteToken: {
              address: quoteToken.address,
              name: quoteToken.name,
              symbol: quoteToken.symbol
            }
          },
          { removeOnComplete: true }
        );
        console.log(`Liquidity spike: ${url} ${prev}→${current}`);
      }
    }
  } catch (err) {
    console.error('detectLiquidity failed:', err);
    throw err;
  }
});
