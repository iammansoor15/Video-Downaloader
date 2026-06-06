import { getJobBus, getJobState, getJobProgress, getJobResult } from '@/lib/jobs';
import type { JobProgress } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Server-Sent Events stream of a job's progress, completion, or failure. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let bus: Awaited<ReturnType<typeof getJobBus>> | null = null;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      const heartbeat = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15000);

      const onProgress = ({ jobId, data }: { jobId: string; data: unknown }) => {
        if (jobId !== id) return;
        const p: JobProgress =
          typeof data === 'object' && data
            ? (data as JobProgress)
            : { status: 'active', percent: Number(data) };
        send('progress', p);
      };
      const onCompleted = async ({ jobId }: { jobId: string }) => {
        if (jobId !== id) return;
        const result = await getJobResult(id).catch(() => null);
        send('completed', {
          downloadUrl: `/api/download/${id}`,
          filename: result?.filename ?? null,
        });
        close();
      };
      const onFailed = ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
        if (jobId !== id) return;
        send('failed', { error: failedReason || 'Download failed.' });
        close();
      };

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        bus?.off('progress', onProgress);
        bus?.off('completed', onCompleted);
        bus?.off('failed', onFailed);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      try {
        bus = await getJobBus();
      } catch {
        send('failed', { error: 'Download service unavailable.' });
        close();
        return;
      }

      // Subscribe before querying current state so a fast finish isn't missed.
      bus.on('progress', onProgress);
      bus.on('completed', onCompleted);
      bus.on('failed', onFailed);

      req.signal.addEventListener('abort', close);

      // Emit the current state right away (covers jobs that settled before connect).
      try {
        const state = await getJobState(id);
        if (state === null) {
          send('failed', { error: 'Job not found.' });
          close();
          return;
        }
        if (state === 'completed') {
          await onCompleted({ jobId: id });
        } else if (state === 'failed') {
          onFailed({ jobId: id, failedReason: '' });
        } else {
          const p = await getJobProgress(id);
          send('progress', { status: 'active', ...(p ?? {}) });
        }
      } catch {
        send('failed', { error: 'Download service unavailable.' });
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
