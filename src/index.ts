import express from 'express';
import 'dotenv/config';

import { createBullBoard } from 'bull-board';
import { BullAdapter } from 'bull-board/bullAdapter';
import {
  fetchNewTokensQueue,
  detectLiquidityQueue,
  notificationQueue,
} from './queue/queues';

import './queue/fetchNewTokensProcessor';
import './queue/detectLiquidityProcessor';
import './queue/notificationProcessor';
import { periodicDetectJob } from './jobs/periodicDetectJob';

const app = express();

const { router } = createBullBoard([
  new BullAdapter(fetchNewTokensQueue),
  new BullAdapter(detectLiquidityQueue),
  new BullAdapter(notificationQueue),
]);
app.use('/admin/queues', router);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

(async () => {
  await fetchNewTokensQueue.add(
    {}, 
  );
  console.log('Scheduled fetchNewTokens every 1.2s (<=60/min)');

})();

setInterval(() => {
  periodicDetectJob().catch(err => console.error('periodicDetectJob failed:', err));
}, 5_000);

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
