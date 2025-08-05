import Bottleneck from 'bottleneck';

export const profilesLimiter = new Bottleneck({ minTime: 1000, maxConcurrent: 1 });
export const searchLimiter   = new Bottleneck({ minTime: 200,  maxConcurrent: 1 });
export const poolsLimiter = new Bottleneck({ minTime: 200, maxConcurrent: 1 });
