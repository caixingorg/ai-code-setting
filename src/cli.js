/**
 * Convert long option names like `project-name` to camelCase keys.
 */
function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Normalize comma-separated or repeated option values into a flat string array.
 */
function parseListValue(input) {
  if (Array.isArray(input)) {
    return input.flatMap((entry) => parseListValue(entry));
  }
  if (input == null || input === "") {
    return [];
  }
  return String(input)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Parse boolean-like CLI values such as true/false/yes/no/1/0.
 */
function parseBooleanValue(value) {
  if (typeof value === "boolean") {
    return value;
  }
  if (value == null) {
    return true;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }
  throw new Error(`无法解析布尔参数：${value}`);
}

/**
 * Create the default parsing result structure so later logic can mutate safely.
 */
function createEmptyResult() {
  return {
    flags: {
      yes: false,
      force: false,
      dryRun: false,
      installThirdPartySkills: false,
      help: false,
      version: false,
      color: true,
      nonInteractive: false,
    },
    values: {
      extra: [],
      mcp: [],
      aiTool: [],
      aiToolPreset: [],
      thirdPartySkill: [],
      thirdPartySkillPreset: [],
    },
    positionals: [],
  };
}

/**
 * Parse raw argv tokens into structured flags and named option values.
 */
function parseArgv(argv) {
  const result = createEmptyResult();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("-")) {
      result.positionals.push(token);
      continue;
    }

    if (token === "--") {
      result.positionals.push(...argv.slice(index + 1));
      break;
    }

    if (token === "-y" || token === "--yes") {
      result.flags.yes = true;
      continue;
    }
    if (token === "-f" || token === "--force") {
      result.flags.force = true;
      continue;
    }
    if (token === "--dry-run") {
      result.flags.dryRun = true;
      continue;
    }
    if (token === "--install-third-party-skills") {
      result.flags.installThirdPartySkills = true;
      continue;
    }
    if (token === "-h" || token === "--help") {
      result.flags.help = true;
      continue;
    }
    if (token === "-v" || token === "--version") {
      result.flags.version = true;
      continue;
    }
    if (token === "--non-interactive") {
      result.flags.nonInteractive = true;
      continue;
    }
    if (token === "--no-color") {
      result.flags.color = false;
      continue;
    }

    const [rawKey, inlineValue] = token.split(/=(.*)/s, 2);
    const key = rawKey.replace(/^--/, "");
    const normalizedKey = toCamelCase(key);
    const nextValue = inlineValue !== undefined ? inlineValue : argv[index + 1];
    const consumeNext = inlineValue === undefined && nextValue !== undefined && !nextValue.startsWith("-");

    if (["config", "cwd", "projectName", "lang", "framework", "db", "orm", "style", "test"].includes(normalizedKey)) {
      const value = inlineValue !== undefined ? inlineValue : consumeNext ? argv[++index] : undefined;
      if (!value) {
        throw new Error(`参数 --${key} 需要一个值`);
      }
      result.values[normalizedKey] = value;
      continue;
    }

    if (normalizedKey === "frontend") {
      const value = inlineValue !== undefined ? inlineValue : consumeNext ? argv[++index] : true;
      result.values.frontend = parseBooleanValue(value);
      continue;
    }

    if (["extra", "mcp", "aiTool", "aiToolPreset", "thirdPartySkill", "thirdPartySkillPreset"].includes(normalizedKey)) {
      const value = inlineValue !== undefined ? inlineValue : consumeNext ? argv[++index] : undefined;
      if (!value) {
        throw new Error(`参数 --${key} 需要一个值`);
      }
      result.values[normalizedKey].push(...parseListValue(value));
      continue;
    }

    throw new Error(`未知参数：${token}`);
  }

  return result;
}

module.exports = {
  parseArgv,
  parseBooleanValue,
  parseListValue,
};
