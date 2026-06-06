import { createReadStream } from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { getJobResult } from '@/lib/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Stream the finished file to the user, then delete it (serve-and-delete model). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const result = await getJobResult(id).catch(() => null);
  if (!result?.filePath) return new Response('Not found', { status: 404 });

  let size: number;
  try {
    size = (await fsp.stat(result.filePath)).size;
  } catch {
    return new Response('File expired or already downloaded.', { status: 410 });
  }

  const nodeStream = createReadStream(result.filePath);
  // Delete the per-job folder once the response finishes streaming.
  nodeStream.on('close', () => {
    void fsp.rm(path.dirname(result.filePath), { recursive: true, force: true }).catch(
      () => {},
    );
  });

  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;
  const filename = encodeURIComponent(result.filename);

  return new Response(webStream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size),
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
