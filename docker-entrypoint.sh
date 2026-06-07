#!/bin/sh
# Container entrypoint: bring up the bgutil POT provider, make sure it's actually
# answering, then start the Next.js app. Run as `tini -- /app/docker-entrypoint.sh`.
#
# Why the wait: if the app starts before the provider is ready, the very first
# YouTube request races startup, gets no PO token, and hits the "Sign in to
# confirm you're not a bot" wall. We block until /ping responds (or warn loudly).

POT_URL="${BGUTIL_POT_BASE_URL:-http://127.0.0.1:4416}"

echo "[entrypoint] starting bgutil POT provider..."
# Prefix the provider's output so it's distinguishable in Render's logs.
( cd /opt/bgutil-provider && node25 build/main.js 2>&1 | sed 's/^/[pot] /' ) &

echo "[entrypoint] waiting for POT provider at ${POT_URL}/ping ..."
i=0
while [ "$i" -lt 40 ]; do
  if curl -fsS "${POT_URL}/ping" >/dev/null 2>&1; then
    echo "[entrypoint] POT provider is ready."
    break
  fi
  i=$((i + 1))
  sleep 1
done

if [ "$i" -ge 40 ]; then
  echo "[entrypoint] WARNING: POT provider never answered after 40s."
  echo "[entrypoint] YouTube downloads will likely fail the bot check. Check the"
  echo "[entrypoint] [pot] log lines above, then hit /api/health to confirm."
fi

echo "[entrypoint] starting Next.js app..."
exec npm start
