import { getJobProgress, getJobResult, getJobState } from '@/lib/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const state = await getJobState(id);
    if (!state) return Response.json({ error: 'Job not found.' }, { status: 404 });

    const [progress, result] = await Promise.all([
      getJobProgress(id),
      getJobResult(id),
    ]);

    return Response.json({
      id,
      state,
      progress,
      filename: result?.filename ?? null,
      downloadUrl: state === 'completed' ? `/api/download/${id}` : null,
      error: state === 'failed' ? 'Download failed.' : null,
    });
  } catch {
    return Response.json(
      { error: 'Download service unavailable.' },
      { status: 503 },
    );
  }
}
