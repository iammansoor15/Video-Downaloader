import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fetchInfo } from '@/lib/ytdlp';
import { buildMediaInfo } from '@/lib/formats';

// Spawns yt-dlp → must run on the Node.js runtime and never be cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ url: z.string().min(1).max(2048) });

export async function POST(req: NextRequest) {
  let url: string;
  try {
    url = Body.parse(await req.json()).url;
    new URL(url); // throws on anything that isn't an absolute URL
  } catch {
    return Response.json({ error: 'A valid URL is required.' }, { status: 400 });
  }

  try {
    const info = await fetchInfo(url);
    return Response.json(buildMediaInfo(info, url));
  } catch (e) {
    const raw = e instanceof Error ? e.message : 'Failed to fetch video info.';
    // Surface yt-dlp's last meaningful line rather than a wall of traceback.
    const clean = raw.split('\n').map((l) => l.trim()).filter(Boolean).pop() ?? raw;
    return Response.json({ error: clean }, { status: 502 });
  }
}
