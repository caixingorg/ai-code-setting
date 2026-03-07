const fs = require("fs");
const path = require("path");

/**
 * Ensure the parent directory of a file exists before writing.
 */
function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

/**
 * Read a UTF-8 text file when it exists, otherwise return null.
 */
function readTextFileIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
}

/**
 * Write a UTF-8 text file and create missing parent directories automatically.
 */
function writeTextFile(filePath, content) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, content.trimStart(), "utf8");
}

/**
 * Return the subset of generated file paths that already exist in the target directory.
 */
function findExistingFiles(baseDir, relativePaths) {
  return relativePaths.filter((relativePath) => fs.existsSync(path.join(baseDir, relativePath)));
}

/**
 * Inspect how a managed block update would affect the target file.
 */
function getManagedBlockAction(filePath, markers) {
  const current = readTextFileIfExists(filePath);

  if (current == null) {
    return "created";
  }

  if (current.includes(markers.start) && current.includes(markers.end)) {
    return "updated";
  }

  return "appended";
}

/**
 * Insert or update a managed block inside a file while preserving user-owned content around it.
 */
function upsertManagedBlock(filePath, markers, content, createPrefix = "") {
  const current = readTextFileIfExists(filePath);
  const block = `${markers.start}\n${content.trim()}\n${markers.end}`;

  if (current == null) {
    const next = createPrefix ? `${createPrefix.trimEnd()}\n\n${block}\n` : `${block}\n`;
    writeTextFile(filePath, next);
    return "created";
  }

  if (current.includes(markers.start) && current.includes(markers.end)) {
    const pattern = new RegExp(`${escapeRegExp(markers.start)}[\\s\\S]*?${escapeRegExp(markers.end)}`);
    const next = current.replace(pattern, block);
    fs.writeFileSync(filePath, next, "utf8");
    return next === current ? "unchanged" : "updated";
  }

  const separator = current.endsWith("\n") ? "\n" : "\n\n";
  fs.writeFileSync(filePath, `${current}${separator}${block}\n`, "utf8");
  return "appended";
}

/**
 * Escape arbitrary text for safe usage inside a RegExp source.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  findExistingFiles,
  getManagedBlockAction,
  readTextFileIfExists,
  upsertManagedBlock,
  writeTextFile,
};
