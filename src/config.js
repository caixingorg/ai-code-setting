const fs = require("fs");
const path = require("path");

const {
  AI_TOOL_OPTIONS,
  AI_TOOL_PRESETS,
  DATABASE_OPTIONS,
  DEFAULT_AI_TOOLS,
  EXTRA_OPTIONS,
  LANGUAGE_OPTIONS,
  MCP_CATALOG,
  STYLE_OPTIONS,
  THIRD_PARTY_SKILL_PRESETS,
  getAvailableMcpKeys,
  getFrameworkOptions,
  getOrmOptions,
  getTestOptions,
  isFrontendFramework,
  isPrimaryDatabase,
} = require("./constants");
const { parseListValue } = require("./cli");

/**
 * Strip comments and trailing commas from lightweight JSONC config files.
 * This implementation intentionally targets simple CLI config documents.
 */
function stripJsonComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/,\s*([}\]])/g, "$1");
}

/**
 * Load user configuration from JSON / JSONC / JS / CJS files.
 */
function loadConfigFile(configPath, cwd = process.cwd()) {
  if (!configPath) {
    return {};
  }

  const absolutePath = path.resolve(cwd, configPath);
  const extension = path.extname(absolutePath).toLowerCase();

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`配置文件不存在：${absolutePath}`);
  }

  if ([".json", ".jsonc"].includes(extension)) {
    const raw = fs.readFileSync(absolutePath, "utf8");
    return JSON.parse(stripJsonComments(raw));
  }

  if ([".js", ".cjs"].includes(extension)) {
    delete require.cache[require.resolve(absolutePath)];
    const loaded = require(absolutePath);
    return loaded && loaded.default ? loaded.default : loaded;
  }

  throw new Error(`暂不支持的配置文件格式：${extension || absolutePath}`);
}

/**
 * Normalize a single choice value and fail fast when the caller provides an invalid option.
 */
function normalizeChoice(value, options, fallback, fieldName) {
  if (value == null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  const matched = options.find((option) => option.toLowerCase() === normalized);
  if (matched) {
    return matched;
  }

  throw new Error(`无效的 ${fieldName}：${value}。可选值：${options.join(" / ")}`);
}

/**
 * Normalize user-provided string arrays and drop empty items.
 */
function normalizeStringArray(value) {
  return parseListValue(value).map((entry) => String(entry).trim()).filter(Boolean);
}

/**
 * Validate extra conventions strictly so typos never fail silently.
 */
function normalizeExtras(value) {
  const requested = normalizeStringArray(value);
  const invalid = requested.filter((entry) => !EXTRA_OPTIONS.some((option) => option.toLowerCase() === entry.toLowerCase()));
  if (invalid.length > 0) {
    throw new Error(`无效的 extra 配置：${invalid.join(", ")}`);
  }

  const lowered = new Set(requested.map((entry) => entry.toLowerCase()));
  return EXTRA_OPTIONS.filter((entry) => lowered.has(entry.toLowerCase()));
}

/**
 * Validate requested MCP integrations and return canonical keys for downstream generation.
 */
function normalizeMcp(value, availableKeys) {
  const requested = normalizeStringArray(value);
  const requestedSet = new Set(requested.map((entry) => entry.toLowerCase()));
  const validNames = availableKeys.flatMap((key) => [key.toLowerCase(), (MCP_CATALOG[key] || "").toLowerCase()]);
  const invalid = requested.filter((entry) => !validNames.includes(entry.toLowerCase()));
  if (invalid.length > 0) {
    throw new Error(`无效的 mcp 配置：${invalid.join(", ")}。当前可选值：${availableKeys.join(" / ")}`);
  }

  return availableKeys.filter((key) => {
    const label = MCP_CATALOG[key] || "";
    return requestedSet.has(key.toLowerCase()) || requestedSet.has(label.toLowerCase());
  });
}

/**
 * Validate AI tool identifiers and return canonical tool keys.
 */
function normalizeAiTools(value) {
  const requested = normalizeStringArray(value).map((entry) => entry.toLowerCase());
  const validToolKeys = Object.keys(AI_TOOL_OPTIONS);
  const invalid = requested.filter((entry) => !validToolKeys.includes(entry));
  if (invalid.length > 0) {
    throw new Error(`无效的 aiTools 配置：${invalid.join(", ")}。可选值：${validToolKeys.join(" / ")}`);
  }

  return [...new Set(requested.length > 0 ? requested : DEFAULT_AI_TOOLS)];
}

/**
 * Validate third-party skills identifiers for skills.sh style packages.
 */
function normalizeThirdPartySkills(value) {
  const requested = normalizeStringArray(value);
  const pattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)?$/;
  const invalid = requested.filter((entry) => !pattern.test(entry));
  if (invalid.length > 0) {
    throw new Error(`无效的 thirdPartySkills 配置：${invalid.join(", ")}。格式应为 owner/repo 或 owner/repo/skill`);
  }

  return [...new Set(requested)];
}

/**
 * Expand named AI tool presets into canonical tool keys.
 */
function normalizeAiToolPresets(value) {
  const requested = normalizeStringArray(value).map((entry) => entry.toLowerCase());
  const validPresetNames = Object.keys(AI_TOOL_PRESETS);
  const invalid = requested.filter((entry) => !validPresetNames.includes(entry));
  if (invalid.length > 0) {
    throw new Error(`无效的 aiToolPreset 配置：${invalid.join(", ")}。可选值：${validPresetNames.join(" / ")}`);
  }

  return requested;
}

/**
 * Expand named third-party skill presets into a flat list of concrete skill identifiers.
 */
function normalizeThirdPartySkillPresets(value) {
  const requested = normalizeStringArray(value).map((entry) => entry.toLowerCase());
  const validPresetNames = Object.keys(THIRD_PARTY_SKILL_PRESETS);
  const invalid = requested.filter((entry) => !validPresetNames.includes(entry));
  if (invalid.length > 0) {
    throw new Error(`无效的 thirdPartySkillPreset 配置：${invalid.join(", ")}。可选值：${validPresetNames.join(" / ")}`);
  }

  return requested;
}

/**
 * Merge configuration file values with CLI overrides while preserving repeated list arguments.
 */
function mergeRawOptions(fileConfig, cliValues) {
  return {
    ...fileConfig,
    ...cliValues,
    extra: [...normalizeStringArray(fileConfig.extra), ...normalizeStringArray(cliValues.extra)],
    mcp: [...normalizeStringArray(fileConfig.mcp || fileConfig.mcpServers), ...normalizeStringArray(cliValues.mcp)],
    aiTools: [...normalizeStringArray(fileConfig.aiTools), ...normalizeStringArray(cliValues.aiTool || cliValues.aiTools)],
    aiToolPresets: [...normalizeStringArray(fileConfig.aiToolPresets), ...normalizeStringArray(cliValues.aiToolPreset || cliValues.aiToolPresets)],
    thirdPartySkills: [
      ...normalizeStringArray(fileConfig.thirdPartySkills),
      ...normalizeStringArray(cliValues.thirdPartySkill || cliValues.thirdPartySkills),
    ],
    thirdPartySkillPresets: [
      ...normalizeStringArray(fileConfig.thirdPartySkillPresets),
      ...normalizeStringArray(cliValues.thirdPartySkillPreset || cliValues.thirdPartySkillPresets),
    ],
  };
}

/**
 * Convert raw config input into the canonical answer object consumed by the generator.
 */
function normalizeAnswers(rawOptions, cwd) {
  const projectName = rawOptions.projectName || path.basename(cwd);
  const lang = normalizeChoice(rawOptions.lang, LANGUAGE_OPTIONS, LANGUAGE_OPTIONS[0], "lang");
  const framework = normalizeChoice(rawOptions.framework, getFrameworkOptions(lang), getFrameworkOptions(lang)[0], "framework");
  const db = normalizeChoice(rawOptions.db, DATABASE_OPTIONS, DATABASE_OPTIONS[0], "db");

  const isFrontend = typeof rawOptions.frontend === "boolean"
    ? rawOptions.frontend
    : isFrontendFramework(framework);

  let orm = "none";
  if (isPrimaryDatabase(db)) {
    const ormOptions = getOrmOptions(db);
    const matchedOrm = normalizeChoice(rawOptions.orm, ormOptions, ormOptions[0], "orm");
    orm = matchedOrm.includes("裸") || matchedOrm.includes("无") ? "none" : matchedOrm;
  }

  let style = "none";
  if (isFrontend) {
    const matchedStyle = normalizeChoice(rawOptions.style, STYLE_OPTIONS, STYLE_OPTIONS[0], "style");
    style = matchedStyle === "无特定方案" ? "none" : matchedStyle;
  }

  const test = normalizeChoice(rawOptions.test, getTestOptions(lang), getTestOptions(lang)[0], "test");
  const extra = normalizeExtras(rawOptions.extra);
  const mcpServers = normalizeMcp(rawOptions.mcp, getAvailableMcpKeys({ db, isFrontend }));
  const aiToolPresets = normalizeAiToolPresets(rawOptions.aiToolPresets);
  const presetAiTools = aiToolPresets.flatMap((preset) => AI_TOOL_PRESETS[preset] || []);
  const aiTools = normalizeAiTools([...(rawOptions.aiTools || []), ...presetAiTools]);
  const thirdPartySkillPresets = normalizeThirdPartySkillPresets(rawOptions.thirdPartySkillPresets);
  const presetSkills = thirdPartySkillPresets.flatMap((preset) => THIRD_PARTY_SKILL_PRESETS[preset] || []);
  const thirdPartySkills = normalizeThirdPartySkills([...(rawOptions.thirdPartySkills || []), ...presetSkills]);

  return {
    projectName,
    lang,
    framework,
    db,
    orm,
    style,
    test,
    extra,
    isFrontend,
    mcpServers,
    aiTools,
    aiToolPresets,
    thirdPartySkills,
    thirdPartySkillPresets,
    projectPath: path.resolve(cwd),
  };
}

module.exports = {
  loadConfigFile,
  mergeRawOptions,
  normalizeAiToolPresets,
  normalizeAiTools,
  normalizeAnswers,
  normalizeThirdPartySkillPresets,
  normalizeThirdPartySkills,
  stripJsonComments,
};
