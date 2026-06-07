# Downloader — container image for Render (or any Docker host).
#
# The whole point of using Docker here: it puts the `yt-dlp` and `ffmpeg`
# binaries on the system PATH, so the app's bare `spawn("yt-dlp", ...)`
# (see lib/ytdlp.ts) resolves exactly like it does on your dev machine —
# no code changes needed.

FROM node:20-bookworm-slim

# System deps:
#  - ffmpeg: yt-dlp shells out to it to merge video+audio and to make MP3s.
#  - yt-dlp: the self-contained Linux build, saved as /usr/local/bin/yt-dlp
#    so the default Linux command name in lib/ytdlp.ts ("yt-dlp") is found.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg ca-certificates curl \
 && curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux \
      -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install node deps first so this layer is cached unless the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

# App source, then build.
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Render injects $PORT and `next start` listens on it automatically.
# EXPOSE is documentation only.
EXPOSE 3000
CMD ["npm", "start"]
