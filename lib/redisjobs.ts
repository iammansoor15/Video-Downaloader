import { downloadQueue, getQueueEvents } from './queue';
import type { JobBackend, JobBus, JobResult } from './jobs';
import type { JobProgress } from './types';

/**
 * BullMQ + Redis backend (enabled with `USE_REDIS=1`). Producer side only —
 * jobs are consumed by the separate worker process (`npm run worker`).
 * Imported lazily by lib/jobs.ts so the default in-process path never touches
 * ioredis.
 */
export const backend: JobBackend = {
  async enqueue(req) {
    const job = await downloadQueue.add('download', req, {
      attempts: 1,
      removeOnComplete: { age: 3600 }, // keep results readable for 1h
      removeOnFail: { age: 3600 },
    });
    return job.id as string;
  },
  getBus() {
    return getQueueEvents() as unknown as JobBus;
  },
  async getState(id) {
    const job = await downloadQueue.getJob(id).catch(() => null);
    if (!job) return null;
    const s = await job.getState();
    if (s === 'completed' || s === 'failed' || s === 'active') return s;
    return 'queued';
  },
  async getProgress(id) {
    const job = await downloadQueue.getJob(id).catch(() => null);
    if (!job) return null;
    return typeof job.progress === 'object' ? (job.progress as JobProgress) : null;
  },
  async getResult(id): Promise<JobResult | null> {
    const job = await downloadQueue.getJob(id).catch(() => null);
    const rv = job?.returnvalue as JobResult | null | undefined;
    return rv?.filePath ? { filePath: rv.filePath, filename: rv.filename } : null;
  },
};
