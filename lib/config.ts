import path from 'node:path';

/** Where downloads are staged before being streamed to the user and deleted. */
export const TMP_DIR = process.env.DL_TMP_DIR
  ? path.resolve(process.env.DL_TMP_DIR)
  : path.join(process.cwd(), 'tmp');

/** Local Redis for BullMQ. On the VPS this stays the default. */
export const REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';

/** BullMQ queue name shared by the web API (producer) and worker (consumer). */
export const QUEUE_NAME = 'downloads';

/** Per-job hard timeout (ms). Default 30 min — generous for 4K, caps runaway jobs. */
export const JOB_TIMEOUT_MS = Number(
  process.env.JOB_TIMEOUT_MS ?? String(30 * 60 * 1000),
);

/** BullMQ worker concurrency. KVM1 = 1 vCPU → keep at 1 (bump to 2 on KVM2). */
export const WORKER_CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? '1');

/**
 * In-process runner parallelism (the default backend, no Redis). yt-dlp jobs are
 * mostly network/disk-bound, so several can run at once — this lets multiple
 * browsers/tabs download simultaneously instead of queueing. Raise it with
 * LOCAL_CONCURRENCY; on a tiny 1-vCPU box you may want to lower it back to 1–2.
 */
export const LOCAL_CONCURRENCY = Math.max(
  1,
  Number(process.env.LOCAL_CONCURRENCY ?? '4'),
);

/** Reject new jobs when free disk drops below this (bytes). Default 10 GB. */
export const MIN_FREE_DISK_BYTES = Number(
  process.env.MIN_FREE_DISK_BYTES ?? String(10 * 1024 ** 3),
);

/** Hard cap on a single output file (bytes). Default 8 GB. 0 = unlimited. */
export const MAX_FILESIZE_BYTES = Number(
  process.env.MAX_FILESIZE_BYTES ?? String(8 * 1024 ** 3),
);

/** How long a finished file may sit in tmp before the sweeper deletes it (ms). */
export const FILE_TTL_MS = Number(process.env.FILE_TTL_MS ?? String(60 * 60 * 1000));

/** Audio bitrate ladder offered in the UI (kbps) — the full 32k–360k range. */
export const AUDIO_BITRATE_LADDER = [32, 64, 96, 128, 160, 192, 256, 320, 360];
