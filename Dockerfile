# Downloader — container image for Render (or any Docker host).
#
# Two things run in this container:
#   1. The Next.js app (Node 20).
#   2. A self-hosted "POT" (Proof-of-Origin Token) provider that mints the token
#      yt-dlp needs to get past YouTube's "Sign in to confirm you're not a bot"
#      check from a datacenter IP. No YouTube account / cookies required.
#
# yt-dlp + ffmpeg are on the PATH, so the app's bare `spawn("yt-dlp")`
# (see lib/ytdlp.ts) resolves exactly like it does on your dev machine.

# ─── Stage 1: prebuilt bgutil POT provider (Node 25 + native canvas addon) ────
FROM brainicism/bgutil-ytdlp-pot-provider:1.3.1 AS pot

# ─── Stage 2: the app ─────────────────────────────────────────────────────────
FROM node:20-bookworm-slim

# System deps:
#  - ffmpeg: yt-dlp shells out to it to merge video+audio and to make MP3s.
#  - python3 + pip: install yt-dlp and its bgutil POT *plugin* (pip is the
#    reliable plugin path — yt-dlp auto-discovers the plugin from site-packages).
#  - tini: clean PID-1 signal handling for our two-process container.
#  - lib{cairo,pango,jpeg,gif,rsvg}: runtime libs the provider's native `canvas`
#    addon links against.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ffmpeg ca-certificates tini curl \
      python3 python3-pip \
      libatomic1 \
      libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
 && python3 -m pip install --no-cache-dir --break-system-packages \
      yt-dlp "bgutil-ytdlp-pot-provider==1.3.1" \
 && rm -rf /var/lib/apt/lists/*

# The POT provider server, plus the Node 25 runtime it was built for. `canvas`
# is ABI-locked to Node 25, so we run the provider with its own node (node25),
# while the app keeps running on Node 20 LTS.
COPY --from=pot /app /opt/bgutil-provider
COPY --from=pot /usr/local/bin/node /usr/local/bin/node25

WORKDIR /app

# Install node deps first so this layer is cached unless the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

# App source, then build.
COPY . .
# Strip any CRLF (the script may be authored on Windows) and make it executable.
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh
RUN npm run build

ENV NODE_ENV=production
# Where the bundled bgutil POT plugin and the /api/health probe reach the
# self-hosted provider. Setting this also flips lib/ytdlp.ts into its hardened,
# datacenter-friendly extractor-args (see authArgs()).
ENV BGUTIL_POT_BASE_URL=http://127.0.0.1:4416
# Render injects $PORT and `next start` listens on it automatically.
EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini", "--"]
# Boot the POT provider, wait until it answers /ping, then start the app.
CMD ["/app/docker-entrypoint.sh"]
