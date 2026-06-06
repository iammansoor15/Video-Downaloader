import { downloadQueue } from '@/lib/queue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const job = await downloadQueue.getJob(id);
    if (!job) return Response.json({ error: 'Job not found.' }, { status: 404 });
    const state = await job.getState();
    const result = job.returnvalue as { filename?: string } | null;
    return Response.json({
      id: job.id,
      state,
      progress: job.progress,
      filename: result?.filename ?? null,
      downloadUrl: state === 'completed' ? `/api/download/${job.id}` : null,
      error: job.failedReason ?? null,
    });
  } catch {
    return Response.json(
      { error: 'Download service unavailable.' },
      { status: 503 },
    );
  }
}
