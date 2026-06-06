import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { runDownload, type RunResult } from './download';
import { LOCAL_CONCURRENCY } from './config';
import type { JobRequest, JobProgress } from './types';
import type { JobBackend, JobBus, JobResult, JobState } from './jobs';

/**
 * In-process job runner: a tiny concurrency-limited queue that runs yt-dlp
 * inside the Next.js server. No Redis, no separate worker. State lives in
 * memory and is cleaned up an hour after each job settles.
 */

interface LocalJob {
  id: string;
  data: JobRequest;
  state: JobState;
  progress: JobProgress;
  result?: RunResult;
  error?: string;
  controller: AbortController;
}

type Store = {
  jobs: Map<string, LocalJob>;
  bus: EventEmitter;
  waiting: string[];
  running: number;
};

// Cache on globalThis so dev hot-reload doesn't drop in-flight jobs / listeners.
const g = globalThis as typeof globalThis & { __localJobs?: Store };
const store: Store = (g.__localJobs ??= {
  jobs: new Map(),
  bus: new EventEmitter(),
  waiting: [],
  running: 0,
});
store.bus.setMaxListeners(0);

const concurrency = LOCAL_CONCURRENCY;

function pump(): void {
  while (store.running < concurrency && store.waiting.length) {
    const id = store.waiting.shift()!;
    const job = store.jobs.get(id);
    if (!job) continue;
    store.running++;
    void execute(job).finally(() => {
      store.running--;
      pump();
    });
  }
}

async function execute(job: LocalJob): Promise<void> {
  job.state = 'active';
  job.progress = { status: 'active', stage: 'starting', percent: 0 };
  try {
    const result = await runDownload(
      job.id,
      job.data,
      (p) => {
        job.progress = p;
        store.bus.emit('progress', { jobId: job.id, data: p });
      },
      job.controller.signal,
    );
    job.state = 'completed';
    job.result = result;
    job.progress = { status: 'completed', percent: 100 };
    store.bus.emit('completed', { jobId: job.id });
  } catch (e) {
    job.state = 'failed';
    job.error = e instanceof Error ? e.message : 'Download failed.';
    store.bus.emit('failed', { jobId: job.id, failedReason: job.error });
  } finally {
    // Forget the record an hour after it settles (the file is deleted on serve).
    setTimeout(() => store.jobs.delete(job.id), 60 * 60 * 1000).unref?.();
  }
}

export const backend: JobBackend = {
  async enqueue(req) {
    const id = randomUUID();
    store.jobs.set(id, {
      id,
      data: req,
      state: 'queued',
      progress: { status: 'queued', percent: 0 },
      controller: new AbortController(),
    });
    store.waiting.push(id);
    pump();
    return id;
  },
  getBus() {
    return store.bus as unknown as JobBus;
  },
  async getState(id) {
    return store.jobs.get(id)?.state ?? null;
  },
  async getProgress(id) {
    return store.jobs.get(id)?.progress ?? null;
  },
  async getResult(id): Promise<JobResult | null> {
    const r = store.jobs.get(id)?.result;
    return r ? { filePath: r.filePath, filename: r.filename } : null;
  },
};
