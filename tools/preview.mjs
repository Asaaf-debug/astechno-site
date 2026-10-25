import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const files = new Set([
  "index.html",
  "nl/index.html",
  "ar/index.html",
  "de/index.html",
  "styles.css",
  "script.js",
  "logo-nav.png",
  "assets/decisphere-logo.png",
  "robots.txt",
  "sitemap.xml",
]);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

export function createPreviewServer() {
  return createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }
    const url = new URL(request.url, "http://localhost");
    if (/^\/(nl|ar|de)$/.test(url.pathname)) {
      response.writeHead(301, { Location: `${url.pathname}/${url.search}` });
      response.end();
      return;
    }
    let file = url.pathname.slice(1);
    if (url.pathname.endsWith("/")) file += "index.html";
    if (!files.has(file)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    try {
      const content = await readFile(path.join(root, file));
      response.writeHead(200, {
        "Content-Type": mime[path.extname(file)],
        "Content-Length": content.length,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch {
      response.writeHead(404);
      response.end("Build the website first: node tools/build.mjs");
    }
  });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 8088);
  const server = createPreviewServer();
  server.listen(port, "127.0.0.1", () =>
    console.log(`Local preview: http://127.0.0.1:${port}`),
  );
}
