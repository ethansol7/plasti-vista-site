import { createReadStream } from "fs";
import { access, stat } from "fs/promises";
import http from "http";
import path from "path";
import process from "process";
import { spawn } from "child_process";

const args = new Set(process.argv.slice(2));
const shouldOpen = args.has("--open");

const cwd = process.cwd();
const presentationDir = path.join(cwd, "presentation-out");
const outDir = path.join(cwd, "out");
const rootDir = (await directoryExists(presentationDir))
  ? presentationDir
  : (await directoryExists(outDir))
    ? outDir
    : cwd;
const port = Number(process.env.PRESENTATION_PORT ?? 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function openBrowser(url) {
  if (!shouldOpen) return;

  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  spawn(command, [url], {
    detached: true,
    stdio: "ignore",
    shell: process.platform === "win32"
  }).unref();
}

function normalizeRequestPath(urlPath) {
  const cleanPath = decodeURIComponent((urlPath ?? "/").split("?")[0]);
  if (cleanPath === "/") return "/index.html";
  if (path.extname(cleanPath)) return cleanPath;
  return `${cleanPath.replace(/\/$/, "")}/index.html`;
}

async function directoryExists(target) {
  try {
    await access(target);
    const details = await stat(target);
    return details.isDirectory();
  } catch {
    return false;
  }
}

const server = http.createServer(async (request, response) => {
  const relativePath = normalizeRequestPath(request.url);
  const absolutePath = path.join(rootDir, relativePath);

  if (!absolutePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(absolutePath);

    if (!fileStat.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const extension = path.extname(absolutePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
      "Cache-Control": "no-cache"
    });

    createReadStream(absolutePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Presentation server running at ${url}`);
  console.log(`Serving files from ${rootDir}`);
  openBrowser(url);
});
