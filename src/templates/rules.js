const { isPrimaryDatabase } = require("../constants");
const { readTemplate, renderTemplate } = require("./renderer");

/**
 * Generate the project-level rules file based on the chosen stack.
 */
function genProjectRules(cfg) {
  const { projectName, lang, framework, db, orm, style, test, extra } = cfg;

  const hasPrimaryDatabase = isPrimaryDatabase(db);
  const hasRedisCache = db === "Redis（仅缓存）";

  const dbLine = hasPrimaryDatabase
    ? `- 数据库：${db}${orm !== "none" ? `（通过 ${orm} 访问，禁止裸 SQL）` : ""}`
    : "";

  const cacheLine = hasRedisCache
    ? "- 缓存：Redis（仅作缓存层，不作为主数据库）"
    : "";

  const styleLine = style !== "none" ? `- 样式方案：${style}（不引入其他 CSS 方案）` : "";
  const extraLines = extra.length > 0 ? extra.map((entry) => `- ${entry}`).join("\n") : "";

  return renderTemplate("rules/project.md", {
    cacheLine,
    dbLine,
    extraLines,
    framework,
    lang,
    projectName,
    styleLine,
    test,
    typeRule: lang.includes("TypeScript")
      ? "any 类型，所有变量必须有明确的类型定义"
      : "未定义的变量，使用 const/let 代替 var",
  });
}

/**
 * Generate generic agent execution safety rules.
 */
function genAgentRules() {
  return readTemplate("rules/agent.md");
}

/**
 * Generate React-oriented implementation rules.
 */
function genReactRules() {
  return readTemplate("rules/react.md");
}

/**
 * Generate Next.js-specific rules when the app router stack is selected.
 */
function genNextjsRules() {
  return readTemplate("rules/nextjs.md");
}

/**
 * Generate Prisma-specific data layer rules.
 */
function genPrismaRules() {
  return readTemplate("rules/prisma.md");
}

/**
 * Generate Python-specific coding rules.
 */
function genPythonRules() {
  return readTemplate("rules/python.md");
}

/**
 * Generate Go-specific coding rules.
 */
function genGoRules() {
  return readTemplate("rules/go.md");
}

module.exports = {
  genAgentRules,
  genGoRules,
  genNextjsRules,
  genPrismaRules,
  genProjectRules,
  genPythonRules,
  genReactRules,
};
