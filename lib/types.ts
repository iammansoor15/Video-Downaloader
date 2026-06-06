/** A single format entry from `yt-dlp -J`. */
export interface YtFormat {
  format_id: string;
  ext: string;
  vcodec?: string | null;
  acodec?: string | null;
  height?: number | null;
  width?: number | null;
  fps?: number | null;
  abr?: number | null; // audio bitrate (kbps)
  vbr?: number | null; // video bitrate (kbps)
  tbr?: number | null; // total bitrate (kbps)
  filesize?: number | null;
  filesize_approx?: number | null;
  format_note?: string;
  resolution?: string;
  protocol?: string;
  dynamic_range?: string | null;
  language?: string | null;
}

/** The relevant subset of `yt-dlp -J` output. */
export interface YtInfo {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: number | null;
  uploader?: string;
  webpage_url?: string;
  extractor?: string;
  extractor_key?: string;
  is_live?: boolean;
  formats: YtFormat[];
}

/** One selectable video quality (144p → 8K). */
export interface VideoOption {
  height: number;
  label: string; // e.g. "1080p (Full HD)"
  fps?: number | null;
  ext: string; // container of the chosen video stream
  formatId: string; // best video(-only) format id at this height
  filesize?: number | null; // bytes (video stream only; audio added on merge)
  hasAudio: boolean; // progressive stream that already carries audio
  needsMerge: boolean; // true when an audio stream must be muxed in
  dynamicRange?: string | null; // SDR / HDR
}

/** Audio choices for the request. */
export interface AudioInfo {
  sourceMaxBitrate: number | null; // best bitrate the source actually provides (kbps)
  ladder: number[]; // offered bitrates (kbps); above source = re-encode, no gain
}

/** Normalised media info returned by /api/info and consumed by the UI. */
export interface MediaInfo {
  id: string;
  title: string;
  thumbnail?: string;
  durationSec?: number | null;
  uploader?: string;
  url: string;
  source: string; // extractor key, e.g. "Youtube"
  isLive: boolean;
  video: VideoOption[]; // sorted high → low
  audio: AudioInfo;
}

/** A queued download request. */
export interface JobRequest {
  url: string;
  /** "video" merges video+audio; "audio" extracts audio only. */
  kind: 'video' | 'audio';
  /** Target height for video (e.g. 1080, 2160, 4320). Ignored for audio. */
  height?: number;
  /** Target audio bitrate in kbps (32–360). */
  audioBitrate?: number;
  /** Output container/format, e.g. "mp4" | "mkv" | "mp3" | "m4a" | "opus". */
  format?: string;
}

/** Progress payload pushed over SSE. */
export interface JobProgress {
  status: 'queued' | 'active' | 'completed' | 'failed';
  percent?: number; // 0–100
  stage?: string; // "downloading" | "merging" | "transcoding" | ...
  speed?: string;
  eta?: string;
  downloaded?: number; // bytes fetched so far (current stream)
  total?: number; // total bytes of the current stream
  error?: string;
  /** Relative download path once completed. */
  downloadUrl?: string;
  filename?: string;
}
