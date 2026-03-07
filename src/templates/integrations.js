const {
  genAgentRules,
  genGoRules,
  genNextjsRules,
  genPrismaRules,
  genProjectRules,
  genPythonRules,
  genReactRules,
} = require("./rules");
const { AI_TOOL_OPTIONS } = require("../constants");
const {
  genSecuritySkill,
  genSkillCodeReview,
  genSkillDebug,
  genSkillGenTests,
  genSkillNewFeature,
  genSkillPRDToDesign,
  genSkillRefactor,
  genThirdPartySkillsGuide,
} = require("./skills");
const { renderTemplate } = require("./renderer");

/**
 * Build the normalized rule list once so different AI tools can reuse the same content.
 */
function buildRuleEntries(cfg) {
  const entries = [
    { name: "project", content: genProjectRules(cfg) },
    { name: "agent", content: genAgentRules() },
  ];

  if (["Next.js", "Nuxt.js"].includes(cfg.framework) || cfg.isFrontend) {
    entries.push({ name: "react", content: genReactRules() });
  }
  if (cfg.framework === "Next.js") {
    entries.push({ name: "nextjs", content: genNextjsRules() });
  }
  if (cfg.orm === "Prisma") {
    entries.push({ name: "prisma", content: genPrismaRules() });
  }
  if (cfg.lang === "Python") {
    entries.push({ name: "python", content: genPythonRules() });
  }
  if (cfg.lang === "Go") {
    entries.push({ name: "go", content: genGoRules() });
  }

  return entries;
}

/**
 * Generate a portable markdown instruction document for tools that consume a single file.
 */
function genPortableInstructions(cfg, toolLabel, ruleEntries) {
  const sections = [
    `# ${cfg.projectName} ${toolLabel} 工作指令`,
    "",
    "以下内容由 ai-sop-setup 自动生成，请根据项目实际情况持续维护。",
  ];

  for (const entry of ruleEntries) {
    sections.push("", `## ${entry.name}`, "", entry.content.trim());
  }

  sections.push(
    "",
    "## skills",
    "",
    "常用任务模板位于 `docs/ai-skills/` 目录，可直接作为可复用 Prompt / Workflow 使用。"
  );

  return sections.join("\n");
}

function getPrimaryInstructionFiles(aiTools) {
  const files = [];

  if ((aiTools || []).includes("cursor")) {
    files.push("- `.cursor/rules/`：Cursor Rules");
  }
  if ((aiTools || []).includes("claude-code")) {
    files.push("- `CLAUDE.md`：Claude Code 项目级说明");
  }
  if ((aiTools || []).includes("github-copilot")) {
    files.push("- `.github/copilot-instructions.md`：GitHub Copilot / VS Code 指令");
  }
  if ((aiTools || []).includes("gemini-cli")) {
    files.push("- `GEMINI.md`：Gemini CLI 上下文说明");
  }
  if ((aiTools || []).includes("openai-codex") || (aiTools || []).includes("antigravity")) {
    const labels = [];
    if ((aiTools || []).includes("openai-codex")) {
      labels.push("OpenAI Codex");
    }
    if ((aiTools || []).includes("antigravity")) {
      labels.push("Antigravity");
    }
    files.push(`- \`AGENTS.md\`：${labels.join(" / ")} 通用 Agent 指令`);
  }

  files.push("- `docs/ai-skills/`：通用任务模板");
  return files.join("\n");
}

function getReadmeToolSteps(aiTools) {
  const steps = [];

  if ((aiTools || []).includes("cursor")) {
    steps.push("1. **Cursor**：自动读取 `.cursor/rules/`，MCP 示例文件为 `.cursor/mcp.json.example`");
  }
  if ((aiTools || []).includes("claude-code")) {
    steps.push(`${steps.length + 1}. **Claude Code**：默认读取根目录 \`CLAUDE.md\` 作为项目级说明`);
  }
  if ((aiTools || []).includes("github-copilot")) {
    steps.push(`${steps.length + 1}. **GitHub Copilot / VS Code**：自动识别 \`.github/copilot-instructions.md\``);
  }
  if ((aiTools || []).includes("gemini-cli")) {
    steps.push(`${steps.length + 1}. **Gemini CLI**：自动读取根目录 \`GEMINI.md\``);
  }
  if ((aiTools || []).includes("openai-codex")) {
    steps.push(`${steps.length + 1}. **OpenAI Codex**：自动读取根目录 \`AGENTS.md\``);
  }
  if ((aiTools || []).includes("antigravity")) {
    steps.push(`${steps.length + 1}. **Antigravity**：使用根目录 \`AGENTS.md\` 作为通用项目指令`);
  }

  steps.push(`${steps.length + 1}. **MCP**：通用示例为 \`.ai-sop/mcp.json.example\`，按目标工具要求导入或复制`);
  steps.push(`${steps.length + 1}. **Skills**：常用任务模板在 \`docs/ai-skills/\` 目录下`);
  return steps.join("\n");
}

/**
 * Generate the MCP server example configuration based on the selected integrations.
 */
function genMCPConfig(cfg) {
  const { projectPath, mcpServers } = cfg;

  const servers = {};

  if (mcpServers.includes("filesystem")) {
    servers.filesystem = {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", projectPath],
    };
  }

  if (mcpServers.includes("git")) {
    servers.git = {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-git", "--repository", "."],
    };
  }

  if (mcpServers.includes("postgres")) {
    servers.postgres = {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres"],
      env: { POSTGRES_CONNECTION_STRING: "${env:DATABASE_URL}" },
    };
  }

  if (mcpServers.includes("mysql")) {
    servers.mysql = {
      command: "npx",
      args: ["-y", "@benborla29/mcp-server-mysql"],
      env: {
        MYSQL_HOST: "${env:DB_HOST}",
        MYSQL_PORT: "${env:DB_PORT}",
        MYSQL_USER: "${env:DB_USER}",
        MYSQL_PASS: "${env:DB_PASSWORD}",
        MYSQL_DB: "${env:DB_NAME}",
      },
    };
  }

  if (mcpServers.includes("github")) {
    servers.github = {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: "${env:GITHUB_TOKEN}" },
    };
  }

  if (mcpServers.includes("browsertools")) {
    servers.browsertools = {
      command: "npx",
      args: ["-y", "@agentdeskai/browser-tools-mcp@latest"],
    };
  }

  if (mcpServers.includes("figma")) {
    servers.figma = {
      command: "npx",
      args: ["-y", "figma-developer-mcp", "--figma-api-key=${env:FIGMA_API_KEY}", "--stdio"],
    };
  }

  if (mcpServers.includes("jira")) {
    servers.jira = {
      command: "npx",
      args: ["-y", "mcp-atlassian"],
      env: {
        JIRA_URL: "${env:JIRA_URL}",
        JIRA_USERNAME: "${env:JIRA_USERNAME}",
        JIRA_API_TOKEN: "${env:JIRA_API_TOKEN}",
      },
    };
  }

  return JSON.stringify({ mcpServers: servers }, null, 2);
}

/**
 * Generate the managed .gitignore block inserted by the CLI.
 */
function genGitignoreBlock() {
  return `# ── AI 工具生成/缓存文件（勿提交）──
.cursor/mcp.json
.cursor/cache/
.cursor/logs/
*.cursor-tuning
CLAUDE.local.md
.claude/settings.local.json

# MCP 临时文件
.mcp-cache/`;
}

/**
 * Generate the README section appended or updated by the CLI.
 */
function genReadmeSection(cfg) {
  return renderTemplate("readme/section.md", {
    primaryInstructionFiles: getPrimaryInstructionFiles(cfg.aiTools),
    projectName: cfg.projectName,
    toolNames: (cfg.aiTools || []).length > 0
      ? (cfg.aiTools || []).map((key) => AI_TOOL_OPTIONS[key] || key).join("、")
      : AI_TOOL_OPTIONS.cursor,
    toolSetupSteps: getReadmeToolSteps(cfg.aiTools),
  });
}

/**
 * Build the complete list of files that should be generated for the current answers.
 */
function buildGeneratedFiles(cfg) {
  const ruleEntries = buildRuleEntries(cfg);
  const files = [
    { path: "docs/ai-skills/feature/new-feature.md", content: genSkillNewFeature(cfg) },
    { path: "docs/ai-skills/feature/prd-to-design.md", content: genSkillPRDToDesign() },
    { path: "docs/ai-skills/debug/analyze-bug.md", content: genSkillDebug() },
    { path: "docs/ai-skills/review/code-review.md", content: genSkillCodeReview() },
    { path: "docs/ai-skills/review/security-check.md", content: genSecuritySkill() },
    { path: "docs/ai-skills/refactor/refactor.md", content: genSkillRefactor() },
    { path: "docs/ai-skills/test/gen-tests.md", content: genSkillGenTests() },
    { path: ".ai-sop/mcp.json.example", content: genMCPConfig(cfg) },
  ];

  if ((cfg.aiTools || []).includes("cursor")) {
    for (const entry of ruleEntries) {
      files.push({ path: `.cursor/rules/${entry.name}.mdc`, content: entry.content });
    }
    files.push({ path: ".cursor/mcp.json.example", content: genMCPConfig(cfg) });
  }

  if ((cfg.aiTools || []).includes("claude-code")) {
    files.push({ path: "CLAUDE.md", content: genPortableInstructions(cfg, "Claude Code", ruleEntries) });
  }

  if ((cfg.aiTools || []).includes("github-copilot")) {
    files.push({ path: ".github/copilot-instructions.md", content: genPortableInstructions(cfg, "GitHub Copilot", ruleEntries) });
  }

  if ((cfg.aiTools || []).includes("gemini-cli")) {
    files.push({ path: "GEMINI.md", content: genPortableInstructions(cfg, "Gemini CLI", ruleEntries) });
  }

  if ((cfg.aiTools || []).includes("openai-codex") || (cfg.aiTools || []).includes("antigravity")) {
    const labels = [];
    if ((cfg.aiTools || []).includes("openai-codex")) {
      labels.push("OpenAI Codex");
    }
    if ((cfg.aiTools || []).includes("antigravity")) {
      labels.push("Antigravity");
    }
    files.push({ path: "AGENTS.md", content: genPortableInstructions(cfg, labels.join(" / "), ruleEntries) });
  }

  if ((cfg.thirdPartySkills || []).length > 0) {
    files.push({ path: "docs/ai-skills/external/skills-sh.md", content: genThirdPartySkillsGuide(cfg) });
    files.push({
      path: ".ai-sop/third-party-skills.json",
      content: JSON.stringify({
        provider: "skills.sh",
        presets: cfg.thirdPartySkillPresets || [],
        install: (cfg.thirdPartySkills || []).map((entry) => ({ id: entry, command: `npx skills add ${entry}` })),
      }, null, 2),
    });
  }

  return files;
}

module.exports = {
  buildGeneratedFiles,
  genGitignoreBlock,
  genMCPConfig,
  genReadmeSection,
};
