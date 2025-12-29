/**
 * Eleventy Configuration
 * 
 * This config is designed to match the URL structure of the original
 * WordPress site at lex.virtual-efficiency.nl
 */

module.exports = function(eleventyConfig) {
  
  // ----- Passthrough Copy -----
  // Copy static assets without processing
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/wp-content"); // Original WP uploads
  eleventyConfig.addPassthroughCopy("admin"); // Decap CMS
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "/robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "/favicon.ico" });

  // ----- Collections -----
  // Create collections for content types if needed
  eleventyConfig.addCollection("pages", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/**/*.md");
  });

  // ----- Filters -----
  // Add custom filters for templates
  
  // Format date in Dutch locale
  eleventyConfig.addFilter("dutchDate", function(date) {
    if (!date) return "";
    return new Intl.DateTimeFormat("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  });

  // Excerpt from content
  eleventyConfig.addFilter("excerpt", function(content, length = 160) {
    if (!content) return "";
    const stripped = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    return stripped.length > length 
      ? stripped.substring(0, length) + "..." 
      : stripped;
  });

  // ----- Shortcodes -----
  // Replicate WordPress shortcodes as Eleventy shortcodes
  
  // WhatsApp button
  eleventyConfig.addShortcode("whatsapp", function(text = "Plan een intake") {
    return `<a href="https://wa.me/31626838558" class="whatsapp-button">${text}</a>`;
  });

  // ----- Markdown Configuration -----
  const markdownIt = require("markdown-it");
  const mdOptions = {
    html: true,
    breaks: true,
    linkify: true
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOptions));

  // ----- Watch Targets -----
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // ----- Server Options -----
  eleventyConfig.setServerOptions({
    port: 8080,
    showAllHosts: true
  });

  // ----- Build Settings -----
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    
    // Match WordPress URL structure (trailing slashes)
    pathPrefix: "/"
  };
};
