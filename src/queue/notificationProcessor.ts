import axios from 'axios';
import { NotificationData, notificationQueue } from './queues';
import { config } from '../config';

notificationQueue.process(async job => {
  const { url, prev, current } = job.data as NotificationData;
  try {
    await axios.post(config.WEBHOOK_URL, {
      text: `🚀 Liquidity spike for pool <${url}|${url}>: ${prev} → ${current}`,
      url,
      prev,
      current,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Notification failed:', err);
    throw err;
  }
});
