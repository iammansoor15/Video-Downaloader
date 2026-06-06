import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { enqueueJob } from '@/lib/jobs';
import { checkDiskSpace } from '@/lib/diskguard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  url: z.string().min(1).max(2048),
  kind: z.enum(['video', 'audio']),
  height: z.number().int().positive().max(4320).optional(),
  audioBitrate: z.number().int().positive().max(360).optional(),
  format: z.string().min(1).max(8).optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
    new URL(body.url);
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (body.kind === 'video' && !body.height) {
    return Response.json({ error: 'A video quality is required.' }, { status: 400 });
  }

  const space = await checkDiskSpace();
  if (!space.ok) {
    return Response.json(
      { error: 'Server is low on disk space. Please try again shortly.' },
      { status: 503 },
    );
  }

  try {
    const jobId = await enqueueJob(body);
    return Response.json({ jobId });
  } catch {
    return Response.json(
      { error: 'Could not start the download. Please try again shortly.' },
      { status: 503 },
    );
  }
}
