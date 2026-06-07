"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MediaInfo } from "@/lib/types";
import { Select, type SelectOption } from "./Select";

type Mode = "video" | "audio";
type Phase = "queued" | "active" | "completed" | "failed";
type Progress = {
  status: Phase;
  percent?: number;
  stage?: string;
  speed?: string;
  eta?: string;
  downloaded?: number;
  total?: number;
};

const AUDIO_FORMATS = ["mp3", "m4a", "opus"] as const;

function triggerBrowserDownload(downloadUrl: string) {
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function formatDuration(sec?: number | null): string {
  if (!sec || sec <= 0) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function DownloaderTool() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<MediaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("video");
  const [height, setHeight] = useState<number | null>(null);
  const [audioFormat, setAudioFormat] =
    useState<(typeof AUDIO_FORMATS)[number]>("mp3");
  const [audioBitrate, setAudioBitrate] = useState<number>(128);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => () => esRef.current?.close(), []);

  async function fetchInfo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setInfo(null);
    setProgress(null);
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch info.");
      const media = data as MediaInfo;
      setInfo(media);
      setHeight(media.video[0]?.height ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function startDownload() {
    if (!info) return;
    setNotice(null);
    setError(null);
    esRef.current?.close();
    setProgress({ status: "queued", percent: 0 });
    setSubmitting(true);
    try {
      const body =
        mode === "video"
          ? { url: info.url, kind: "video", height, format: "mp4" }
          : { url: info.url, kind: "audio", audioBitrate, format: audioFormat };
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start download.");
      const jobId = data.jobId as string;

      const es = new EventSource(`/api/progress/${jobId}`);
      esRef.current = es;
      es.addEventListener("progress", (ev) => {
        const p = JSON.parse((ev as MessageEvent).data);
        setProgress({
          status: "active",
          percent: p.percent,
          stage: p.stage,
          speed: p.speed,
          eta: p.eta,
          downloaded: p.downloaded,
          total: p.total,
        });
      });
      es.addEventListener("completed", (ev) => {
        const p = JSON.parse((ev as MessageEvent).data);
        setProgress({ status: "completed", percent: 100 });
        es.close();
        setSubmitting(false);
        if (p.downloadUrl) triggerBrowserDownload(p.downloadUrl);
        setNotice(
          `Ready${p.filename ? `: ${p.filename}` : ""} - your download should start automatically.`,
        );
      });
      es.addEventListener("failed", (ev) => {
        const p = JSON.parse((ev as MessageEvent).data);
        setProgress({ status: "failed" });
        es.close();
        setSubmitting(false);
        setError(p.error ?? "Download failed.");
      });
      es.onerror = () => {
        es.close();
        setSubmitting(false);
      };
    } catch (err) {
      setProgress(null);
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const sourceMax = info?.audio.sourceMaxBitrate ?? null;

  const videoOptions = useMemo<SelectOption[]>(
    () =>
      (info?.video ?? []).map((v) => ({
        value: String(v.height),
        label: [
          v.label,
          v.fps ? `${v.fps}fps` : null,
          v.filesize ? `~${formatBytes(v.filesize)}` : null,
        ]
          .filter(Boolean)
          .join(" - "),
      })),
    [info],
  );

  const formatOptions = useMemo<SelectOption[]>(
    () => AUDIO_FORMATS.map((f) => ({ value: f, label: f.toUpperCase() })),
    [],
  );

  const bitrateOptions = useMemo<SelectOption[]>(
    () =>
      (info?.audio.ladder ?? []).map((b) => ({
        value: String(b),
        label: `${b} kbps`,
        note: sourceMax !== null && b > sourceMax ? "re-encode" : undefined,
      })),
    [info, sourceMax],
  );

  const downloadLabel = submitting
    ? progress?.status === "queued"
      ? "Queued..."
      : `Processing${progress?.percent != null ? ` ${Math.round(progress.percent)}%` : "..."}`
    : "Download";

  return (
    <>
      <form
        onSubmit={fetchInfo}
        className="flex flex-col gap-2.5 sm:flex-row"
        aria-label="Fetch video formats"
      >
        <label htmlFor="video-url" className="sr-only">
          Video URL
        </label>
        <input
          id="video-url"
          type="url"
          inputMode="url"
          placeholder="Paste a video link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/35 focus:bg-white/[0.06] focus:ring-2 focus:ring-white/10"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Fetching..." : "Fetch"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {info && (
        <section className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="flex gap-4">
            {info.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={info.thumbnail}
                alt={info.title ? `${info.title} thumbnail` : ""}
                className="h-24 w-40 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
              />
            )}
            <div className="min-w-0">
              <h2 className="line-clamp-2 font-semibold text-white">
                {info.title}
              </h2>
              <p className="mt-1 text-xs text-white/50">
                {[info.uploader, info.source, formatDuration(info.durationSec)]
                  .filter(Boolean)
                  .join(" - ")}
              </p>
            </div>
          </div>

          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 text-sm">
            {(["video", "audio"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
                  mode === m
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                {m === "video" ? "Video" : "Audio only"}
              </button>
            ))}
          </div>

          {mode === "video" ? (
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-white/80">Quality</span>
              <Select
                ariaLabel="Video quality"
                value={height != null ? String(height) : ""}
                onChange={(v) => setHeight(Number(v))}
                options={videoOptions}
                placeholder={
                  videoOptions.length ? "Select quality" : "No video streams found"
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-2">
                <span className="font-medium text-white/80">Format</span>
                <Select
                  ariaLabel="Audio format"
                  value={audioFormat}
                  onChange={(v) =>
                    setAudioFormat(v as (typeof AUDIO_FORMATS)[number])
                  }
                  options={formatOptions}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-white/80">Bitrate</span>
                <Select
                  ariaLabel="Audio bitrate"
                  value={String(audioBitrate)}
                  onChange={(v) => setAudioBitrate(Number(v))}
                  options={bitrateOptions}
                />
              </div>
            </div>
          )}

          {mode === "audio" && sourceMax !== null && (
            <p className="-mt-2 text-xs text-white/45">
              Source provides up to ~{sourceMax} kbps. Higher values re-encode
              without adding real quality.
            </p>
          )}

          <button
            type="button"
            onClick={startDownload}
            disabled={submitting}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadLabel}
          </button>

          {progress && progress.status !== "failed" && (
            <div className="flex flex-col gap-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400 transition-all duration-300"
                  style={{
                    width: `${progress.status === "completed" ? 100 : progress.percent ?? 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-white/50">
                {progress.status === "completed"
                  ? "Done"
                  : [
                      progress.downloaded != null &&
                      progress.total != null &&
                      progress.total > 0
                        ? `${formatBytes(progress.downloaded)} / ${formatBytes(progress.total)}`
                        : progress.stage ?? "queued",
                      progress.speed,
                      progress.eta ? `ETA ${progress.eta}` : null,
                    ]
                      .filter(Boolean)
                      .join(" - ")}
              </p>
            </div>
          )}

          {notice && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
              {notice}
            </div>
          )}
        </section>
      )}
    </>
  );
}
