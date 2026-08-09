module.exports = function (eleventyConfig) {
  // Passthrough: copy static assets and admin into the build output as-is
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // Watch for changes during dev
  eleventyConfig.addWatchTarget("src/assets/");

  // Collections — content/pages/*.md becomes "pages"
  eleventyConfig.addCollection("pages", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/pages/*.{md,njk}");
  });
  eleventyConfig.addCollection("team", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/team/*.md")
      .sort((a, b) => (a.data.order || 999) - (b.data.order || 999));
  });
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/blog/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Date filter for templates
  eleventyConfig.addFilter("dateReadable", (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Current year (for the copyright footer)
  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "content/_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // The default permalink behavior: content/pages/about.md -> /about/index.html
    // Each .md frontmatter can override with `permalink:`.
  };
};
