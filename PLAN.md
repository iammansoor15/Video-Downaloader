# Video Downloader — Project Plan

A public Next.js web app that downloads videos from YouTube, Twitter/X, Instagram,
TikTok, and ~1,800 other sites via **yt-dlp + ffmpeg**, offering the full range of
video resolutions (**144p → 8K**) and audio bitrates (**32k → 360k**).

---

## Status legend
- [ ] = not started
- [~] = in progress
- [x] = done

> **Rule:** when a task is finished, change `[ ]` to `[x]`. Use `[~]` while actively working it.

---

## 1. Target environment

| Item | Value |
|---|---|
| Host | **Hostinger KVM1 VPS** (prepaid) |
| CPU | 1 vCPU *(assumed — confirm)* |
| RAM | 4 GB *(assumed — confirm)* |
| Disk | 50 GB NVMe *(assumed — confirm)* |
| Bandwidth | 4 TB / month *(assumed — confirm)* |
| App scope | **Public web app** |
| Download model | **Async job queue** (BullMQ) |
| Storage model | **Serve from VPS disk → delete immediately** (no R2/S3) |
| Deploy style | **Native + PM2** (lighter on 4 GB) — Docker Compose optional |

> If the plan is actually KVM2 (2 vCPU / 8 GB), bump worker concurrency from 1 → 2.

---

## 2. Architecture (single box)

```
Hostinger KVM1  (1 vCPU · 4 GB RAM · 50 GB disk · 4 TB/mo)
│
├─ Nginx             → TLS + reverse proxy
├─ Next.js (web+API) → UI, /api/jobs, SSE progress       ┐ PM2
├─ BullMQ worker     → yt-dlp + ffmpeg, concurrency = 1   │ (or docker
├─ Redis (local)     → queue + job state                 ┘  compose)
└─ /tmp  → download → stream to user → DELETE immediately
```

**Job lifecycle**
1. `POST /api/jobs` → validate URL + rate-limit + CAPTCHA → enqueue → return `jobId`.
2. Worker pulls job → `yt-dlp` downloads → `ffmpeg` remux/merge → file in `/tmp`.
3. Browser subscribes via **SSE** → live progress %.
4. On done → stream file to browser → **delete temp file immediately**.

---

## 3. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.2.7** (App Router, Turbopack) + React 19 + TypeScript |
| UI | React + Tailwind + shadcn/ui |
| Download engine | **yt-dlp** (Python) |
| Media processing | **ffmpeg** (default: remux `-c copy`; transcode only when forced) |
| Queue / jobs | **BullMQ + Redis** (local), worker **concurrency = 1** |
| Progress | Server-Sent Events (SSE) |
| Process mgmt | PM2 (web + worker) |
| Reverse proxy | Nginx + Let's Encrypt TLS |
| Abuse control | Redis rate-limit + Cloudflare Turnstile |

---

## 4. Core technical facts driving the design
1. **yt-dlp is the engine** — no per-site scrapers; it handles 1,800+ sites.
2. **Hi-res (>1080p) = two streams** — video-only + audio-only must be **merged by ffmpeg**.
   8K only exists in VP9/AV1 → output **MKV** (remux, no transcode) to stay cheap on 1 core.
3. **Audio bitrates come from ffmpeg, not the source** — transcode with `-b:a`.
   Going above source bitrate (e.g. 360k from 128k) is re-encode with **no real quality gain** → label honestly in UI.

---

## 5. The four hard limits of KVM1 (and the fix)
| Limit | Fix in design |
|---|---|
| 1 vCPU | Default **remux (`-c copy`)`; worker **concurrency = 1`; transcode only when forced |
| 4 GB RAM | Keep concurrency low; Redis + Next.js + 1 worker fit fine |
| 50 GB disk | Download → serve → **delete now**; **free-space guard** rejects jobs if < ~10 GB free; max-filesize cap |
| 4 TB/mo BW | Fine for thousands of normal downloads; **monitor** outbound |

---

## 6. Project structure (target)
```
Downloader/
├─ app/
│  ├─ page.tsx                  # URL input + format pickers + progress
│  └─ api/
│     ├─ info/route.ts          # yt-dlp -J → available formats
│     ├─ jobs/route.ts          # enqueue download job
│     ├─ jobs/[id]/route.ts     # job status / result
│     └─ progress/[id]/route.ts # SSE progress channel
├─ lib/
│  ├─ ytdlp.ts                  # spawn wrapper, JSON + progress parse
│  ├─ formats.ts                # map yt-dlp formats → UI (144p–8K, 32k–360k)
│  ├─ queue.ts                  # BullMQ queue + worker (concurrency 1)
│  ├─ diskguard.ts              # free-space check before accepting jobs
│  └─ cleanup.ts                # delete temp files after serving
├─ components/                  # ResolutionSelect, AudioSelect, ProgressBar
├─ worker/index.ts              # BullMQ worker process
├─ tmp/                         # temp downloads (auto-cleaned)
├─ ecosystem.config.js          # PM2 (web + worker)
└─ package.json
```

---

## 7. Operational notes
- **YouTube bot-detection:** datacenter IPs get challenged. Plan a **cookies/proxy hook**; treat YouTube as **best-effort**. Twitter/IG/TikTok are easier.
- **Cleanup:** every job deletes its temp file on completion/failure; add a cron sweep for orphans.
- **Legal (public app):** ship a **ToS / acceptable-use** page, **DMCA contact**, disclaimer; don't retain user URLs/content tied to identity.

---

## 8. Phased task checklist

### Phase 0 — Setup & scaffolding
- [x] Install yt-dlp on VPS (and locally for dev) — dev: yt-dlp **2026.03.17** via `python -m yt_dlp`
- [x] Verify ffmpeg present — **v8.0** confirmed on dev box
- [x] Scaffold Next.js + TypeScript + Tailwind — got **Next 16.2.7 / React 19 / Tailwind v4**
- [ ] Add shadcn/ui
- [x] Local downloads no longer need Redis — added an **in-process job backend** (`lib/localjobs.ts`, default). Redis/BullMQ is now **opt-in** via `USE_REDIS=1` for the VPS deploy. (Local Redis still blocked by Docker Desktop, but no longer required for dev.)
- [ ] Set up PM2 ecosystem (web + worker)
- [x] Project skeleton — `lib/` + `app/api/info` created (config, types, ytdlp, formats)

### Phase 1 — Info API (list formats) ✅ verified against live YouTube
- [x] `lib/ytdlp.ts` spawn wrapper + JSON parse (safe array args, timeout, abort)
- [x] `lib/formats.ts` group formats → resolution (144p–8K) + audio (32k–360k)
- [x] `app/api/info/route.ts` endpoint (`runtime=nodejs`, `force-dynamic`)
- [x] Handle errors (bad URL → 400; yt-dlp failure → 502 with cleaned message)

### Phase 2 — Queue + progress
- [x] `lib/queue.ts` BullMQ queue (Redis path) **+** `lib/localjobs.ts` in-process runner (concurrency = 1). `lib/jobs.ts` façade picks the backend (`USE_REDIS`).
- [x] `lib/diskguard.ts` free-space guard
- [x] `app/api/jobs/route.ts` enqueue
- [~] `app/api/jobs/[id]/route.ts` status — superseded by SSE; standalone status route still TODO
- [x] `app/api/progress/[id]/route.ts` SSE channel (backend-agnostic)
- [x] Parse yt-dlp progress → emit % over SSE

### Phase 3 — Download worker (video) — verified end-to-end (in-process)
- [x] `worker/index.ts` consume jobs (Redis path) / in-process runner consumes by default
- [x] yt-dlp format selector per chosen resolution
- [x] ffmpeg **remux** merge (video-only + audio-only) → MP4/MKV
- [x] Stream finished file to browser
- [x] Delete temp file immediately after serve

### Phase 4 — Audio path — verified (mp3)
- [x] Audio-only extraction (`-x`)
- [x] Bitrate transcode 32k–360k via ffmpeg `-b:a`
- [x] Output mp3 / m4a / opus selectable
- [x] Honest "no quality gain above source" labeling

### Phase 5 — UI (core built & verified in browser)
- [x] URL input + paste/validate
- [x] Resolution dropdown (144p–8K, shows fps / size / "merged") — custom dark, translucent `Select`
- [x] Audio bitrate dropdown (32k–360k, marks re-encode above source)
- [x] Video / Audio-only toggle
- [x] Progress bar (SSE) + download button — live % over SSE, auto-starts browser download
- [x] Error + ready states — error banner + green "ready" notice

### Phase 6 — Abuse & cost control
- [ ] Redis per-IP rate limiting
- [ ] Cloudflare Turnstile (CAPTCHA)
- [ ] Max-filesize cap
- [ ] Queue-depth limit → reject when full
- [ ] Cleanup cron for orphan temp files

### Phase 7 — Reliability (YouTube)
- [ ] Cookies hook (`--cookies`) for YouTube
- [ ] Optional proxy support
- [ ] Retries + clear error surfacing
- [ ] yt-dlp auto-update strategy

### Phase 8 — Legal & polish
- [ ] ToS / acceptable-use page
- [ ] DMCA contact + disclaimer
- [ ] UI polish + responsive

### Phase 9 — Deploy
- [ ] Nginx reverse proxy + Let's Encrypt TLS
- [ ] PM2 start web + worker, enable on boot
- [ ] Bandwidth/disk monitoring
- [ ] Smoke test from public URL

---

## 9. Progress log
- 2026-06-06 — Plan written.
- 2026-06-06 — **Phase 0** (mostly) + **Phase 1** done: yt-dlp 2026.03.17 + ffmpeg 8.0 verified; Next 16.2.7 app scaffolded; `bullmq`/`ioredis`/`zod`/`tsx` installed; `lib/{config,types,ytdlp,formats}.ts` + `/api/info` built and **verified live** (YouTube "Me at the zoo" returned correct video/audio options). **Blocker:** Docker Desktop engine not running → no local Redis yet for the queue (Phase 2+).
- 2026-06-06 — **Phase 5 core** done: `app/page.tsx` downloader UI (URL fetch, media card, video/audio toggle, quality + bitrate selectors). Verified in browser at localhost:3000 (`GET /` 200, no compile errors). Download button wired to `/api/jobs` (shows "worker not enabled" until queue exists). **Next:** Phase 2/3 (queue + worker) — needs Redis.
- 2026-06-06 — **Downloads working without Redis (Phases 2–4 functional).** Replaced the hard BullMQ/Redis dependency with a backend façade (`lib/jobs.ts`): default **in-process runner** (`lib/localjobs.ts`) runs yt-dlp inside Next — no Redis, no separate worker; the BullMQ path (`lib/redisjobs.ts` + `worker/`) is now opt-in via `USE_REDIS=1`. `/api/jobs`, `/api/progress/[id]`, `/api/download/[id]` rewired to the façade. **Verified end-to-end over HTTP** (enqueue → SSE `completed` → file stream → serve-and-delete) for **video (360p mp4)** and **audio (128k mp3)**; no more `ECONNREFUSED 127.0.0.1:6379`. `tsc` + `eslint` clean.
- 2026-06-06 — **Parallel downloads + dropdown fix.** (1) In-process runner now uses a dedicated `LOCAL_CONCURRENCY` (`lib/config.ts`, default **4**) instead of `WORKER_CONCURRENCY` — multiple browsers/tabs download **simultaneously** (verified: 2× 360p ran together, 3.6s total vs ~7s sequential). (2) Fixed custom `Select` not closing on pick — the pickers were wrapped in `<label>`, which re-fired a click on the trigger button and reopened the menu; swapped the three `<label>`s for `<div>`s in `app/page.tsx` (accessibility kept via `ariaLabel`).
- 2026-06-06 — **UI pass.** Native `<select>` (white OS dropdown) replaced with a custom **dark, translucent, blurred** `Select` component (`app/components/Select.tsx`, keyboard-navigable). Polished page to a cohesive dark theme with a subtle gradient backdrop; gradient progress bar; green ready-state. Added `suppressHydrationWarning` to `<html>` to silence the Dark Reader extension hydration mismatch.
