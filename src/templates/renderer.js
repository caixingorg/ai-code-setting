const fs = require("fs");
const path = require("path");

const templateCache = new Map();
const TEMPLATE_ROOT = path.resolve(__dirname, "../template-assets");

/**
 * Read a static template file from disk and cache its contents in memory.
 */
function readTemplate(relativePath) {
  if (!templateCache.has(relativePath)) {
    const absolutePath = path.join(TEMPLATE_ROOT, relativePath);
    templateCache.set(relativePath, fs.readFileSync(absolutePath, "utf8"));
  }

  return templateCache.get(relativePath);
}

/**
 * Replace {{placeholders}} inside a template using a simple string map.
 */
function renderTemplate(relativePath, variables = {}) {
  const template = readTemplate(relativePath);
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
    const value = variables[key];
    return value == null ? "" : String(value);
  });
}

module.exports = {
  readTemplate,
  renderTemplate,
};
