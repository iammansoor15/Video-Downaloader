import type { JobRequest, JobProgress } from './types';

/**
 * Job-system façade. The app has two interchangeable backends:
 *
 *  - **in-process** (default): runs yt-dlp directly inside the Next.js server,
 *    no Redis and no separate worker process. Ideal for local dev and small
 *    single-box deploys.
 *  - **BullMQ + Redis** (set `USE_REDIS=1`): the original queued backend for the
 *    public VPS deploy, with a separate `npm run worker` process.
 *
 * Routes import only from here, so swapping backends never touches the API.
 */

export type JobState = 'queued' | 'active' | 'completed' | 'failed';

export interface JobResult {
  filePath: string;
  filename: string;
}

type ProgressEvt = { jobId: string; data: unknown };
type CompletedEvt = { jobId: string };
type FailedEvt = { jobId: string; failedReason: string };

/** Minimal event surface shared by the EventEmitter and BullMQ QueueEvents. */
export interface JobBus {
  on(event: 'progress', cb: (a: ProgressEvt) => void): unknown;
  on(event: 'completed', cb: (a: CompletedEvt) => void): unknown;
  on(event: 'failed', cb: (a: FailedEvt) => void): unknown;
  off(event: 'progress', cb: (a: ProgressEvt) => void): unknown;
  off(event: 'completed', cb: (a: CompletedEvt) => void): unknown;
  off(event: 'failed', cb: (a: FailedEvt) => void): unknown;
}

export interface JobBackend {
  enqueue(req: JobRequest): Promise<string>;
  getBus(): JobBus;
  getState(id: string): Promise<JobState | null>;
  getProgress(id: string): Promise<JobProgress | null>;
  getResult(id: string): Promise<JobResult | null>;
}

export const USE_REDIS =
  process.env.USE_REDIS === '1' || process.env.USE_REDIS === 'true';

// Load the chosen backend lazily so the in-process path never imports BullMQ /
// ioredis (which would open a Redis connection and spam ECONNREFUSED).
let cached: Promise<JobBackend> | null = null;
function getBackend(): Promise<JobBackend> {
  return (cached ??= (USE_REDIS
    ? import('./redisjobs')
    : import('./localjobs')
  ).then((m) => m.backend));
}

export async function enqueueJob(req: JobRequest): Promise<string> {
  return (await getBackend()).enqueue(req);
}
export async function getJobBus(): Promise<JobBus> {
  return (await getBackend()).getBus();
}
export async function getJobState(id: string): Promise<JobState | null> {
  return (await getBackend()).getState(id);
}
export async function getJobProgress(id: string): Promise<JobProgress | null> {
  return (await getBackend()).getProgress(id);
}
export async function getJobResult(id: string): Promise<JobResult | null> {
  return (await getBackend()).getResult(id);
}
