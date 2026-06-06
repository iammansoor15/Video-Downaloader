import { statfs } from 'node:fs/promises';
import { MIN_FREE_DISK_BYTES, TMP_DIR } from './config';

/**
 * Check free disk space on the volume holding TMP_DIR. On platforms where
 * statfs is unsupported, the guard fails open (treats space as available).
 */
export async function checkDiskSpace(): Promise<{ ok: boolean; freeBytes: number }> {
  try {
    const s = await statfs(TMP_DIR);
    const free = Number(s.bavail) * Number(s.bsize);
    return { ok: free >= MIN_FREE_DISK_BYTES, freeBytes: free };
  } catch {
    return { ok: true, freeBytes: Number.POSITIVE_INFINITY };
  }
}
