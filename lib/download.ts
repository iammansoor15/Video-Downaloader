import path from 'node:path';
import fs from 'node:fs/promises';
import { runYtDlp, authArgs } from './ytdlp';
import { TMP_DIR, JOB_TIMEOUT_MS } from './config';
import type { JobRequest, JobProgress } from './types';

// Machine-readable progress line we can parse out of yt-dlp's output.
// Fields: percent | speed | eta | downloaded_bytes | total_bytes(estimate)
const PROGRESS_TPL =
  'download:DLPROGRESS %(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s|%(progress.downloaded_bytes)s|%(progress.total_bytes,progress.total_bytes_estimate)s';

export interface RunResult {
  /** Absolute path of the finished file on disk. */
  filePath: string;
  /** User-facing filename (video title + ext). */
  filename: string;
  ext: string;
}

/**
 * Run a single download/transcode job with yt-dlp + ffmpeg.
 * Streams progress via `onProgress` and resolves with the output file path.
 */
export async function runDownload(
  jobId: string,
  req: JobRequest,
  onProgress: (p: JobProgress) => void,
  signal?: AbortSignal,
): Promise<RunResult> {
  const jobDir = path.join(TMP_DIR, jobId);
  await fs.mkdir(jobDir, { recursive: true });

  const ext = req.kind === 'audio' ? req.format ?? 'mp3' : req.format ?? 'mp4';
  const outTpl = path.join(jobDir, '%(title).200B.%(ext)s');

  const args: string[] = [
    '--newline',
    '--no-playlist',
    '--no-warnings',
    '--no-part',
    '--progress-template',
    PROGRESS_TPL,
    '-o',
    outTpl,
  ];

  if (req.kind === 'audio') {
    const br = req.audioBitrate ?? 128;
    // -x extracts audio; --audio-quality <n>K sets ffmpeg -b:a for the chosen format.
    args.push('-x', '--audio-format', ext, '--audio-quality', `${br}K`);
  } else {
    const h = req.height ?? 1080;
    // Prefer AAC audio over YouTube's default Opus — Opus inside an MP4 is
    // unplayable in many desktop players (Windows Media Player, QuickTime).
    // At ≤1080p also prefer H.264 video so the file plays everywhere; above
    // 1080p only VP9/AV1 exist, so keep the resolution and just force AAC audio.
    const fmt =
      h <= 1080
        ? `bv*[height<=${h}][vcodec^=avc1]+ba[ext=m4a]/` +
          `bv*[height<=${h}]+ba[ext=m4a]/` +
          `bv*[height<=${h}]+ba/b[height<=${h}]`
        : `bv*[height<=${h}]+ba[ext=m4a]/` +
          `bv*[height<=${h}]+ba/b[height<=${h}]`;
    args.push('-f', fmt, '--merge-output-format', ext);
  }

  // Cookies / proxy (anti-bot, age-restricted, private) — shared with fetchInfo.
  args.push(...authArgs());

  args.push(req.url);

  let stage: JobProgress['stage'] = 'downloading';
  const handleLine = (line: string) => {
    if (line.startsWith('DLPROGRESS')) {
      const [pct, speed, eta, dl, total] = line
        .slice('DLPROGRESS'.length)
        .trim()
        .split('|')
        .map((s) => s.trim());
      const percent = parseFloat(pct);
      const downloaded = Number(dl);
      const totalBytes = Number(total);
      onProgress({
        status: 'active',
        stage,
        percent: Number.isFinite(percent) ? percent : undefined,
        speed: speed || undefined,
        eta: eta || undefined,
        downloaded: Number.isFinite(downloaded) ? downloaded : undefined,
        total: Number.isFinite(totalBytes) ? totalBytes : undefined,
      });
    } else if (/\[Merger\]|Merging formats/i.test(line)) {
      stage = 'merging';
      onProgress({ status: 'active', stage, percent: 99 });
    } else if (/\[ExtractAudio\]/i.test(line)) {
      stage = 'transcoding';
      onProgress({ status: 'active', stage, percent: 99 });
    }
  };

  await runYtDlp(args, {
    onStdout: handleLine,
    onStderr: handleLine,
    signal,
    timeoutMs: JOB_TIMEOUT_MS,
  });

  // The only media file left in the per-job folder is the finished output.
  const files = await fs.readdir(jobDir);
  const finished =
    files.find((f) => f.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) ?? files[0];
  if (!finished) throw new Error('Download finished but no output file was produced.');

  const filePath = path.join(jobDir, finished);
  return { filePath, filename: finished, ext: path.extname(finished).slice(1) };
}
