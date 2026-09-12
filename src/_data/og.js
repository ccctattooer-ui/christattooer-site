// Social card: one 1200px-wide copy of the photo named in site.json (ogImage), generated at build time.
// This is the picture Instagram, iMessage, Facebook and Google show when someone shares a link to the
// site, so it is worth it being a real photo rather than nothing. Change it in Site settings.
import fs from "node:fs";
import Image from "@11ty/eleventy-img";

export default async function () {
  const site = JSON.parse(fs.readFileSync("src/_data/site.json", "utf8"));
  const src = site.ogImage || "";
  const local = "." + src;
  if (!src || !fs.existsSync(local)) return null;
  const m = await Image(local, { widths: [1200], formats: ["jpeg"], outputDir: "_site/assets/og", urlPath: "/assets/og", sharpJpegOptions: { quality: 82 } });
  const o = m.jpeg[0];
  return { url: o.url, width: o.width, height: o.height, alt: site.ogImageAlt || site.tagline };
}
