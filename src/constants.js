const path = require("path");

const PACKAGE_INFO = require(path.resolve(__dirname, "../package.json"));

const LANGUAGE_OPTIONS = ["TypeScript", "JavaScript", "Python", "Go", "Java", "Rust"];

const FRAMEWORK_OPTIONS = {
  TypeScript: ["Next.js", "Express", "NestJS", "Fastify", "Hono", "无框架"],
  JavaScript: ["Next.js", "Express", "Nuxt.js", "Fastify", "无框架"],
  Python: ["FastAPI", "Django", "Flask", "无框架"],
  Go: ["Gin", "Echo", "Fiber", "Chi", "无框架"],
  Java: ["Spring Boot", "Quarkus", "Micronaut", "无框架"],
  Rust: ["Axum", "Actix-web", "无框架"],
};

const DATABASE_OPTIONS = ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis（仅缓存）", "无数据库"];

const ORM_OPTIONS = {
  PostgreSQL: ["Prisma", "Drizzle", "TypeORM", "SQLAlchemy", "GORM", "裸 SQL / 无 ORM"],
  MySQL: ["Prisma", "Drizzle", "TypeORM", "SQLAlchemy", "GORM", "裸 SQL / 无 ORM"],
  MongoDB: ["Mongoose", "Prisma", "无 ODM"],
  SQLite: ["Prisma", "Drizzle", "无 ORM"],
};

const STYLE_OPTIONS = ["Tailwind CSS", "CSS Modules", "Styled Components", "Sass/SCSS", "无特定方案"];

const TEST_OPTIONS = {
  TypeScript: ["Jest", "Vitest", "无测试"],
  JavaScript: ["Jest", "Vitest", "无测试"],
  Python: ["pytest", "unittest", "无测试"],
  Go: ["Go testing（内置）", "testify", "无测试"],
  Java: ["JUnit 5", "无测试"],
  Rust: ["Rust 内置测试", "无测试"],
};

const EXTRA_OPTIONS = [
  "代码提交前必须通过 lint（ESLint / golangci-lint）",
  "代码提交前必须通过类型检查（tsc --noEmit）",
  "代码提交前必须通过所有单元测试",
  "必须有 Code Review 才能合并到 main",
  "使用 Conventional Commits 规范提交信息",
  "API 变更必须同步更新文档（OpenAPI / README）",
];

const MCP_CATALOG = {
  filesystem: "filesystem（读写本地文件，Agent 必备）",
  git: "git（读取 Git 历史和 diff）",
  postgres: "postgres（直接查询数据库）",
  mysql: "mysql（直接查询数据库）",
  github: "github（操作 GitHub Issues / PR）",
  browsertools: "browsertools（控制浏览器调试）",
  figma: "figma（读取设计稿）",
  jira: "jira（读取项目任务）",
};

const AI_TOOL_OPTIONS = {
  cursor: "Cursor",
  "claude-code": "Claude Code",
  "github-copilot": "GitHub Copilot / VS Code",
  "gemini-cli": "Gemini CLI",
  "openai-codex": "OpenAI Codex",
  antigravity: "Antigravity",
};

const AI_TOOL_PRESETS = {
  editor: ["cursor", "github-copilot"],
  terminal: ["claude-code", "gemini-cli", "openai-codex", "antigravity"],
  "all-major": ["cursor", "claude-code", "github-copilot", "gemini-cli", "openai-codex", "antigravity"],
};

const DEFAULT_AI_TOOLS = ["cursor"];

const THIRD_PARTY_SKILL_PRESETS = {
  frontend: [
    "anthropics/skills/frontend-design",
    "vercel-labs/agent-skills/web-design-guidelines",
  ],
  review: [
    "vercel-labs/skills/find-skills",
    "vercel-labs/agent-skills/web-design-guidelines",
  ],
  design: [
    "anthropics/skills/frontend-design",
    "vercel-labs/agent-skills/web-design-guidelines",
  ],
  azure: [
    "microsoft/github-copilot-for-azure/azure-ai",
  ],
};

const ALWAYS_GENERATED_FILES = [
  "docs/ai-skills/feature/new-feature.md",
  "docs/ai-skills/feature/prd-to-design.md",
  "docs/ai-skills/debug/analyze-bug.md",
  "docs/ai-skills/review/code-review.md",
  "docs/ai-skills/review/security-check.md",
  "docs/ai-skills/refactor/refactor.md",
  "docs/ai-skills/test/gen-tests.md",
  ".ai-sop/mcp.json.example",
];

const MANAGED_BLOCKS = {
  gitignore: {
    start: "# >>> ai-sop-setup managed block >>>",
    end: "# <<< ai-sop-setup managed block <<<",
  },
  readme: {
    start: "<!-- ai-sop-setup:readme:start -->",
    end: "<!-- ai-sop-setup:readme:end -->",
  },
};

/**
 * Build a tiny color facade so the rest of the CLI does not care whether ANSI is enabled.
 */
function createColors(enabled) {
  const wrap = (code) => (value) => enabled ? `${code}${value}\x1b[0m` : String(value);

  return {
    enabled,
    raw: {
      reset: enabled ? "\x1b[0m" : "",
      bold: enabled ? "\x1b[1m" : "",
      dim: enabled ? "\x1b[2m" : "",
      cyan: enabled ? "\x1b[36m" : "",
      green: enabled ? "\x1b[32m" : "",
      yellow: enabled ? "\x1b[33m" : "",
      red: enabled ? "\x1b[31m" : "",
      blue: enabled ? "\x1b[34m" : "",
      magenta: enabled ? "\x1b[35m" : "",
      bgBlue: enabled ? "\x1b[44m" : "",
    },
    bold: wrap("\x1b[1m"),
    dim: wrap("\x1b[2m"),
    cyan: wrap("\x1b[36m"),
    green: wrap("\x1b[32m"),
    yellow: wrap("\x1b[33m"),
    red: wrap("\x1b[31m"),
    blue: wrap("\x1b[34m"),
    magenta: wrap("\x1b[35m"),
  };
}

/**
 * Return whether the selected database should be treated as a primary persistence layer.
 */
function isPrimaryDatabase(db) {
  return !["none", "无数据库", "Redis（仅缓存）"].includes(db);
}

/**
 * Detect whether the chosen framework implies a frontend runtime by default.
 */
function isFrontendFramework(framework) {
  return ["Next.js", "Nuxt.js"].includes(framework);
}

/**
 * Compute the set of available MCP integrations based on current project answers.
 */
function getAvailableMcpKeys({ db, isFrontend }) {
  return [
    "filesystem",
    "git",
    db === "PostgreSQL" ? "postgres" : null,
    db === "MySQL" ? "mysql" : null,
    "github",
    isFrontend ? "browsertools" : null,
    isFrontend ? "figma" : null,
    "jira",
  ].filter(Boolean);
}

/**
 * Get the framework options valid for the selected programming language.
 */
function getFrameworkOptions(lang) {
  return FRAMEWORK_OPTIONS[lang] || ["无框架"];
}

/**
 * Get the ORM / DB client options valid for the selected database.
 */
function getOrmOptions(db) {
  return ORM_OPTIONS[db] || ["无 ORM"];
}

/**
 * Get the test framework options valid for the selected programming language.
 */
function getTestOptions(lang) {
  return TEST_OPTIONS[lang] || ["无测试"];
}

/**
 * Render CLI help text in one place so docs and tests can assert against it.
 */
function buildHelpText(binName = "ai-sop-setup") {
  return [
    `${PACKAGE_INFO.name} v${PACKAGE_INFO.version}`,
    "",
    `用法: ${binName} [command] [options]`,
    "",
    "命令:",
    "  init                     初始化 Rules / Skills / MCP 配置（默认命令）",
    "  validate-config          只校验并展示归一化后的配置，不写文件",
    "",
    "核心参数:",
    "  -y, --yes                  非交互模式，使用默认值或传入配置",
    "  -f, --force                发现已存在文件时直接覆盖",
    "      --dry-run              仅预览将写入的文件，不真正落盘",
    "  -c, --config <path>        读取 JSON / JSONC / JS / CJS 配置文件",
    "      --cwd <path>           指定目标目录，默认当前目录",
    "      --non-interactive      禁用交互提示",
    "      --no-color             关闭彩色输出",
    "  -h, --help                 显示帮助",
    "  -v, --version              显示版本",
    "",
    "可选配置覆盖:",
    "      --project-name <name>",
    "      --lang <name>",
    "      --framework <name>",
    "      --db <name>",
    "      --orm <name>",
    "      --style <name>",
    "      --test <name>",
    "      --frontend <true|false>",
    "      --extra <item1,item2>  可重复传入",
    "      --mcp <item1,item2>    可重复传入，支持 filesystem/git/postgres/...",
    `      --ai-tool <name>       可重复传入，支持 ${Object.keys(AI_TOOL_OPTIONS).join("/")}`,
    `      --ai-tool-preset <name> 可重复传入，支持 ${Object.keys(AI_TOOL_PRESETS).join("/")}`,
    "      --third-party-skill <repoOrSkill>  可重复传入，支持 owner/repo 或 owner/repo/skill",
    `      --third-party-skill-preset <name> 可重复传入，支持 ${Object.keys(THIRD_PARTY_SKILL_PRESETS).join("/")}`,
    "      --install-third-party-skills      显式执行第三方 skills 安装命令",
    "",
    "示例:",
    `  ${binName} --yes --force --lang TypeScript --framework Next.js`,
    `  ${binName} --config ./ai-sop.config.json --force`,
  ].join("\n");
}

module.exports = {
  AI_TOOL_OPTIONS,
  AI_TOOL_PRESETS,
  ALWAYS_GENERATED_FILES,
  DATABASE_OPTIONS,
  DEFAULT_AI_TOOLS,
  EXTRA_OPTIONS,
  FRAMEWORK_OPTIONS,
  LANGUAGE_OPTIONS,
  MANAGED_BLOCKS,
  MCP_CATALOG,
  ORM_OPTIONS,
  PACKAGE_INFO,
  STYLE_OPTIONS,
  TEST_OPTIONS,
  THIRD_PARTY_SKILL_PRESETS,
  buildHelpText,
  createColors,
  getAvailableMcpKeys,
  getFrameworkOptions,
  getOrmOptions,
  getTestOptions,
  isFrontendFramework,
  isPrimaryDatabase,
};
