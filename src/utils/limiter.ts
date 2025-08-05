import Bottleneck from 'bottleneck';

export const listLimiter   = new Bottleneck({ minTime: 1200, maxConcurrent: 1 });

export const detailLimiter = new Bottleneck({ minTime: 200,  maxConcurrent: 1 });
