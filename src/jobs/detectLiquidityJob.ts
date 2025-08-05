import { DetectJobData, detectLiquidityQueue } from '../queue/queues';

export async function detectLiquidityJob(data: DetectJobData) {
  await detectLiquidityQueue.add(data, { removeOnComplete: true });
}
