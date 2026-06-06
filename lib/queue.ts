import { Queue, QueueEvents, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { REDIS_URL, QUEUE_NAME } from './config';
import type { JobRequest } from './types';

// BullMQ bundles its own ioredis copy, so an instance of the project's ioredis
// isn't structurally identical to BullMQ's `ConnectionOptions`. The cast bridges
// the two duplicate type definitions (runtime behaviour is unaffected).
const asConnection = (c: IORedis): ConnectionOptions => c as unknown as ConnectionOptions;

/**
 * Singletons cached on globalThis so Next.js dev hot-reload doesn't open a new
 * Redis connection on every module re-evaluation.
 */
type Cache = {
  connection?: IORedis;
  queue?: Queue<JobRequest>;
  events?: QueueEvents;
};
const g = globalThis as typeof globalThis & { __downloader?: Cache };
const cache: Cache = (g.__downloader ??= {});

function newConnection(): IORedis {
  const conn = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  conn.on('error', (e) => {
    // Avoid noisy unhandled 'error' events when Redis is down in dev.
    if (process.env.DEBUG_REDIS) console.error('[redis]', e.message);
  });
  return conn;
}

export function getConnection(): IORedis {
  return (cache.connection ??= newConnection());
}

export const downloadQueue: Queue<JobRequest> = (cache.queue ??= new Queue<JobRequest>(
  QUEUE_NAME,
  { connection: asConnection(getConnection()) },
));

/** Shared QueueEvents (own blocking connection) used by the SSE progress route. */
export function getQueueEvents(): QueueEvents {
  return (cache.events ??= new QueueEvents(QUEUE_NAME, {
    connection: asConnection(newConnection()),
  }));
}
