import { fetchNewTokensQueue } from './queues';
import { fetchNewTokensJob } from '../jobs/fetchNewTokensJob';

fetchNewTokensQueue.process(async (_job) => {
  try {
    await fetchNewTokensJob();
  } catch (err) {
    console.error('fetchNewTokensJob failed:', err);
    throw err;
  }
});

fetchNewTokensQueue.add({}, { repeat: { every: 120 } });
