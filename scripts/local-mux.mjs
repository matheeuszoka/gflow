import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", args, { windowsHide: true, stdio: "ignore" });
    const timer = setTimeout(() => { child.kill(); reject(new Error("Conversion timed out")); }, 120000);
    child.on("error", err => { clearTimeout(timer); reject(err); });
    child.on("exit", code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error("Conversion failed")); });
  });
}

let busy = false;
export async function handleLocalMux(req, res, port) {
  const hosts = [`localhost:${port}`, `127.0.0.1:${port}`];
  const allowedOrigin = hosts.map(host => `http://${host}`);
  if (process.env.PUBLIC_ORIGIN) {
    const publicUrl = new URL(process.env.PUBLIC_ORIGIN);
    hosts.push(publicUrl.host);
    allowedOrigin.push(publicUrl.origin);
  }
  if (!hosts.includes(req.headers.host) || !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress)) {
    res.writeHead(403).end(); return;
  }
  if (req.method === "GET") {
    try { await ffmpeg(["-version"]); res.writeHead(200, { "content-type": "application/json" }).end('{"available":true}'); }
    catch { res.writeHead(503).end(); }
    return;
  }
  if (req.method !== "POST" || !allowedOrigin.includes(req.headers.origin)) {
    res.writeHead(403).end(); return;
  }
  if (busy) { res.writeHead(429).end("Outra exportação está em andamento. Tente novamente em instantes."); return; }
  const split = Number(req.headers["x-video-bytes"]);
  const limit = 90 * 1024 * 1024;
  if (!Number.isSafeInteger(split) || split <= 0 || split >= limit) { res.writeHead(400).end(); return; }
  let dir;
  busy = true;
  try {
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > limit) { res.writeHead(413).end(); return; }
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    if (body.length <= split + 44 || body.toString("ascii", split, split + 4) !== "RIFF") {
      res.writeHead(400).end(); return;
    }
    dir = await mkdtemp(join(tmpdir(), "guiaflow-mux-"));
    const video = join(dir, "video.mp4"), audio = join(dir, "audio.wav"), output = join(dir, "output.mp4");
    await writeFile(video, body.subarray(0, split));
    await writeFile(audio, body.subarray(split));
    await ffmpeg(["-nostdin", "-y", "-v", "error", "-i", video, "-i", audio,
      "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", output]);
    res.writeHead(200, { "content-type": "video/mp4", "cache-control": "no-store" });
    res.end(await readFile(output));
  } catch {
    if (!res.headersSent) res.writeHead(500);
    res.end("Não foi possível montar o MP4 localmente.");
  } finally {
    busy = false;
    if (dir) await rm(dir, { recursive: true, force: true });
  }
}
