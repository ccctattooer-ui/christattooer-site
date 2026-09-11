export default function (eleventyConfig) {
  // /admin/ is the Sveltia CMS app: copied as-is, never rendered as a template.
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "assets/paintings": "assets/paintings" });
  eleventyConfig.addPassthroughCopy({ "assets/uploads": "assets/uploads" });
  // Cloudflare Pages reads these from the output folder: cache/noindex headers and the www redirect.
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers", "src/_redirects": "_redirects" });
  // Web-ready images only. Raw photo folders (Tattoo_Images etc.) never ship.
  eleventyConfig.addPassthroughCopy({ "assets/tattoos": "assets/tattoos" });
  eleventyConfig.addPassthroughCopy({ "assets/flash/web": "assets/flash/web" });
  eleventyConfig.addPassthroughCopy({ "assets/plants": "assets/plants" });
  eleventyConfig.addPassthroughCopy({ "assets/favicon.png": "assets/favicon.png" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js" });
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.addFilter("money", (n) => (n === "" || n == null ? "" : "$" + Number(n).toLocaleString("en-US")));
  eleventyConfig.addFilter("hrs", (n) => (n === "" || n == null ? "" : `${n} hr`));
  eleventyConfig.addFilter("visible", (arr) => arr.filter((x) => !x.hidden));
  eleventyConfig.addFilter("featuredFirst", (arr) => [...arr].sort((a, b) => (b.featured === true) - (a.featured === true)));
  eleventyConfig.addFilter("uniqueCats", (arr) => [...new Set(arr.map((x) => x.category))]);
  eleventyConfig.addFilter("uniqueGames", (arr) => [...new Set(arr.map((x) => x.game))]);
  eleventyConfig.addFilter("where", (arr, key, val) => arr.filter((x) => x[key] === val));
  eleventyConfig.addFilter("slug", (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
