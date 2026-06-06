import type { YtInfo, YtFormat, MediaInfo, VideoOption } from './types';
import { AUDIO_BITRATE_LADDER } from './config';

/** Known resolution tier names. */
const RES_NAMES: Record<number, string> = {
  144: '144p',
  240: '240p',
  360: '360p',
  480: '480p',
  720: '720p (HD)',
  1080: '1080p (Full HD)',
  1440: '1440p (2K)',
  2160: '2160p (4K)',
  2880: '2880p (5K)',
  4320: '4320p (8K)',
};

function labelForHeight(h: number): string {
  if (RES_NAMES[h]) return RES_NAMES[h];
  if (h >= 4320) return `${h}p (8K)`;
  if (h >= 2160) return `${h}p (4K)`;
  if (h >= 1440) return `${h}p (2K)`;
  if (h >= 720) return `${h}p (HD)`;
  return `${h}p`;
}

const isVideoStream = (f: YtFormat) =>
  !!f.vcodec && f.vcodec !== 'none' && !!f.height;
const isAudioStream = (f: YtFormat) =>
  (!f.vcodec || f.vcodec === 'none') && !!f.acodec && f.acodec !== 'none';
const carriesAudio = (f: YtFormat) => !!f.acodec && f.acodec !== 'none';

/** Normalise raw yt-dlp output into the shape the UI needs. */
export function buildMediaInfo(info: YtInfo, requestUrl: string): MediaInfo {
  const formats = info.formats ?? [];

  // Keep the highest-bitrate video stream per distinct height.
  const byHeight = new Map<number, YtFormat>();
  for (const f of formats) {
    if (!isVideoStream(f)) continue;
    const h = f.height as number;
    const score = f.tbr ?? f.vbr ?? 0;
    const cur = byHeight.get(h);
    const curScore = cur ? (cur.tbr ?? cur.vbr ?? 0) : -1;
    if (!cur || score > curScore) byHeight.set(h, f);
  }

  const video: VideoOption[] = [...byHeight.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([h, f]) => ({
      height: h,
      label: labelForHeight(h),
      fps: f.fps ?? null,
      ext: f.ext,
      formatId: f.format_id,
      filesize: f.filesize ?? f.filesize_approx ?? null,
      hasAudio: carriesAudio(f),
      needsMerge: !carriesAudio(f),
      dynamicRange: f.dynamic_range ?? null,
    }));

  // Best audio bitrate the source actually provides (kbps).
  let sourceMax: number | null = null;
  for (const f of formats) {
    if (!isAudioStream(f)) continue;
    const abr = f.abr ?? f.tbr ?? 0;
    if (abr && (sourceMax === null || abr > sourceMax)) sourceMax = Math.round(abr);
  }

  return {
    id: info.id,
    title: info.title,
    thumbnail: info.thumbnail,
    durationSec: info.duration ?? null,
    uploader: info.uploader,
    url: info.webpage_url ?? requestUrl,
    source: info.extractor_key ?? info.extractor ?? 'unknown',
    isLive: !!info.is_live,
    video,
    audio: { sourceMaxBitrate: sourceMax, ladder: AUDIO_BITRATE_LADDER },
  };
}
