const test = require("node:test");
const assert = require("node:assert/strict");

const { buildGeneratedFiles } = require("../../src/templates");

test("buildGeneratedFiles 返回核心输出清单和条件模板", () => {
  const files = buildGeneratedFiles({
    projectName: "demo-app",
    lang: "TypeScript",
    framework: "Next.js",
    db: "PostgreSQL",
    orm: "Prisma",
    style: "Tailwind CSS",
    test: "Vitest",
    extra: [],
    isFrontend: true,
    mcpServers: ["filesystem", "git"],
    aiTools: ["cursor", "claude-code", "github-copilot", "gemini-cli", "openai-codex", "antigravity"],
    projectPath: "/tmp/demo-app",
  });

  const paths = files.map((entry) => entry.path);
  assert(paths.includes(".ai-sop/mcp.json.example"));
  assert(paths.includes(".cursor/rules/project.mdc"));
  assert(paths.includes(".cursor/rules/nextjs.mdc"));
  assert(paths.includes(".cursor/rules/prisma.mdc"));
  assert(paths.includes("CLAUDE.md"));
  assert(paths.includes(".github/copilot-instructions.md"));
  assert(paths.includes("GEMINI.md"));
  assert(paths.includes("AGENTS.md"));
  assert(paths.includes("docs/ai-skills/feature/new-feature.md"));
  assert(paths.includes(".cursor/mcp.json.example"));
});
