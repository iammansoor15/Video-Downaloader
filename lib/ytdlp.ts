import { spawn } from 'node:child_process';
import type { YtInfo } from './types';

/**
 * Resolve how to invoke yt-dlp.
 * - Windows dev box: defaults to `python -m yt_dlp` (pip install, no PATH shim).
 * - Linux/VPS: defaults to the `yt-dlp` binary.
 * - Override either with the YTDLP_CMD env var, e.g. "yt-dlp" or "python3 -m yt_dlp".
 */
export function resolveYtDlp(): { cmd: string; prefixArgs: string[] } {
  const override = process.env.YTDLP_CMD?.trim();
  if (override) {
    const [cmd, ...prefixArgs] = override.split(/\s+/);
    return { cmd, prefixArgs };
  }
  if (process.platform === 'win32') {
    return { cmd: 'python', prefixArgs: ['-m', 'yt_dlp'] };
  }
  return { cmd: 'yt-dlp', prefixArgs: [] };
}

/**
 * Base URL of the self-hosted bgutil POT (Proof-of-Origin Token) provider.
 * The Docker image starts it and sets this env (see Dockerfile); when it's set
 * we know we're running in the container alongside the provider, so authArgs()
 * switches into its hardened, datacenter-friendly defaults. Empty on the dev box
 * (no provider) → authArgs() leaves yt-dlp's own defaults alone.
 * /api/health pings the same URL.
 */
export const POT_BASE_URL = process.env.BGUTIL_POT_BASE_URL?.trim() || '';

/**
 * Anti-bot / auth args applied to EVERY yt-dlp call (info + download).
 * YouTube returns "Sign in to confirm you're not a bot" from datacenter IPs
 * unless the request both (a) carries a PO token and (b) uses a client that
 * accepts one. The Docker image self-hosts a POT provider; the args below make
 * yt-dlp actually use it instead of silently falling back to a tokenless client.
 *
 * Levers (all optional, all override the defaults):
 *  - YTDLP_COOKIES: path to a cookies.txt (logged-in session) — most reliable.
 *  - YTDLP_PROXY: proxy URL (a residential proxy is the strongest fix).
 *  - YTDLP_EXTRACTOR_ARGS: raw --extractor-args value that fully replaces the
 *    hardened defaults, e.g. "youtube:player_client=web_safari".
 */
export function authArgs(): string[] {
  const args: string[] = [];
  if (process.env.YTDLP_COOKIES) args.push('--cookies', process.env.YTDLP_COOKIES);
  if (process.env.YTDLP_PROXY) args.push('--proxy', process.env.YTDLP_PROXY);

  if (process.env.YTDLP_EXTRACTOR_ARGS) {
    // Full manual override — the caller owns client selection + POT wiring.
    args.push('--extractor-args', process.env.YTDLP_EXTRACTOR_ARGS);
  } else if (POT_BASE_URL) {
    // In the container with the provider running. Force the GVS-PO-token
    // clients the bgutil provider can serve (listing several lets yt-dlp fall
    // back if one is rate-limited), and point the plugin explicitly at our
    // provider so it never silently degrades to a tokenless request.
    args.push('--extractor-args', 'youtube:player_client=web_safari,web,mweb');
    args.push('--extractor-args', `youtubepot-bgutilhttp:base_url=${POT_BASE_URL}`);
  }
  return args;
}

export interface RunOptions {
  onStderr?: (line: string) => void;
  onStdout?: (line: string) => void;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * Spawn yt-dlp with the given args. Resolves with full stdout on exit code 0,
 * rejects with stderr otherwise. Args are passed as an array (no shell) so URLs
 * and user input can't be interpreted by a shell.
 */
export function runYtDlp(args: string[], opts: RunOptions = {}): Promise<string> {
  const { cmd, prefixArgs } = resolveYtDlp();
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, [...prefixArgs, ...args], {
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    const stdoutBuf = '';
    const stderrBuf = '';

    const timer = opts.timeoutMs
      ? setTimeout(() => {
          child.kill('SIGKILL');
          reject(new Error('yt-dlp timed out'));
        }, opts.timeoutMs)
      : null;

    const onAbort = () => child.kill('SIGKILL');
    opts.signal?.addEventListener('abort', onAbort);

    const pump = (
      chunk: string,
      bufRef: { v: string },
      cb?: (line: string) => void,
    ) => {
      if (!cb) return;
      bufRef.v += chunk;
      const lines = bufRef.v.split(/\r?\n|\r/);
      bufRef.v = lines.pop() ?? '';
      for (const line of lines) if (line) cb(line);
    };
    const outBuf = { v: stdoutBuf };
    const errBuf = { v: stderrBuf };

    child.stdout.on('data', (d) => {
      const s = d.toString();
      stdout += s;
      pump(s, outBuf, opts.onStdout);
    });
    child.stderr.on('data', (d) => {
      const s = d.toString();
      stderr += s;
      pump(s, errBuf, opts.onStderr);
    });

    child.on('error', (e) => {
      if (timer) clearTimeout(timer);
      opts.signal?.removeEventListener('abort', onAbort);
      reject(e);
    });
    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      opts.signal?.removeEventListener('abort', onAbort);
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
    });
  });
}

/** Fetch metadata + formats for a single URL (playlists collapsed to one item). */
export async function fetchInfo(url: string): Promise<YtInfo> {
  const out = await runYtDlp(
    ['-J', '--no-warnings', '--no-playlist', '--no-progress', ...authArgs(), url],
    { timeoutMs: 45_000 },
  );
  return JSON.parse(out) as YtInfo;
}
