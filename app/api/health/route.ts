import { POT_BASE_URL, runYtDlp } from '@/lib/ytdlp';

// Spawns yt-dlp + talks to the local POT provider → Node runtime, never cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint: open https://<your-app>/api/health on the deployed
 * instance to see, at a glance, whether the anti-bot plumbing is actually up.
 * The single most common cause of "Sign in to confirm you're not a bot" is the
 * POT provider not running — this tells you that immediately.
 *
 * Returns 200 only when the POT provider answers; 503 otherwise.
 */
export async function GET() {
  const potUrl = POT_BASE_URL || 'http://127.0.0.1:4416';

  const pot: Record<string, unknown> = {
    configured: Boolean(POT_BASE_URL),
    baseUrl: potUrl,
  };

  // Is the bgutil POT provider answering on its port?
  try {
    const res = await fetch(`${potUrl}/ping`, { signal: AbortSignal.timeout(4000) });
    pot.ok = res.ok;
    if (res.ok) {
      try {
        pot.info = await res.json();
      } catch {
        /* /ping returned non-JSON; ok flag already tells the story */
      }
    } else {
      pot.status = res.status;
    }
  } catch (e) {
    pot.ok = false;
    pot.error = e instanceof Error ? e.message : String(e);
  }

  // Does the yt-dlp binary resolve and run?
  let ytdlpVersion: string | null = null;
  let ytdlpError: string | undefined;
  try {
    ytdlpVersion = (await runYtDlp(['--version'], { timeoutMs: 8000 })).trim();
  } catch (e) {
    ytdlpError = e instanceof Error ? e.message : String(e);
  }

  return Response.json(
    {
      ok: pot.ok === true,
      pot,
      ytdlp: { version: ytdlpVersion, error: ytdlpError },
      auth: {
        cookies: Boolean(process.env.YTDLP_COOKIES),
        proxy: Boolean(process.env.YTDLP_PROXY),
        extractorArgsOverride: Boolean(process.env.YTDLP_EXTRACTOR_ARGS),
      },
    },
    { status: pot.ok === true ? 200 : 503 },
  );
}
