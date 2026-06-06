import { Worker, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { REDIS_URL, QUEUE_NAME, WORKER_CONCURRENCY } from '../lib/config';
import { runDownload } from '../lib/download';
import type { JobRequest, JobProgress } from '../lib/types';

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
connection.on('error', (e) => console.error('[redis]', e.message));

const worker = new Worker<JobRequest>(
  QUEUE_NAME,
  async (job) => {
    const update = (p: JobProgress) => {
      void job.updateProgress(p);
    };
    update({ status: 'active', stage: 'starting', percent: 0 });
    const result = await runDownload(job.id as string, job.data, update);
    return result; // stored as job.returnvalue, read by /api/download/[id]
  },
  {
    connection: connection as unknown as ConnectionOptions,
    concurrency: WORKER_CONCURRENCY,
  },
);

worker.on('completed', (job) => console.log(`✓ job ${job.id} completed`));
worker.on('failed', (job, err) =>
  console.error(`✗ job ${job?.id} failed: ${err?.message}`),
);
worker.on('error', (err) => console.error('[worker]', err.message));

console.log(
  `Download worker up (queue="${QUEUE_NAME}", concurrency=${WORKER_CONCURRENCY}). Waiting for jobs…`,
);

const shutdown = async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
