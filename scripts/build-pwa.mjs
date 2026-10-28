import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
const dir = "dist",
  base = "/FlowerParadise/";
const assets = (await readdir(join(dir, "assets"))).filter((f) =>
  /\.(js|css|woff2)$/.test(f),
);
const version = createHash("sha256")
  .update(
    (await readFile(join(dir, "index.html"))).toString() + assets.join("|"),
  )
  .digest("hex")
  .slice(0, 12);
const core = [
  "index.html",
  "offline.html",
  "manifest.webmanifest",
  "favicon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  ...(await readdir(join(dir, "fonts")))
    .filter((f) => /\.woff2?$/.test(f))
    .map((f) => "fonts/" + f),
  ...assets.map((a) => "assets/" + a),
].map((a) => base + a);
const source = await readFile("public/sw.js", "utf8");
await writeFile(
  join(dir, "sw.js"),
  source
    .replace("__BUILD_VERSION__", version)
    .replace("__PRECACHE__", JSON.stringify(core)),
);
console.log(`PWA ${version}: ${core.length} static core files`);
