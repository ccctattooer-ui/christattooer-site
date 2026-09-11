// Keeps the generated thumbnails (and eleventy-img's cache) between Netlify builds.
// eleventy-img skips any image whose output already exists, so a build only processes new photos.
const DIRS = ["_site/assets/thumbs", ".cache"];
export const onPreBuild = async ({ utils }) => {
  const ok = await utils.cache.restore(DIRS);
  console.log(ok ? "thumb-cache: restored thumbnails from the build cache" : "thumb-cache: no cache yet");
};
export const onPostBuild = async ({ utils }) => {
  await utils.cache.save(DIRS);
  console.log("thumb-cache: saved thumbnails to the build cache");
};
