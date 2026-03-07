const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeAnswers } = require("../../src/config");
const { buildGeneratedFiles } = require("../../src/templates");
const { buildThirdPartySkillInstallPlan } = require("../../src/services/third-party-skills");

test("normalizeAnswers 接受第三方 skills 配置", () => {
  const answers = normalizeAnswers({
    projectName: "demo-app",
    lang: "TypeScript",
    framework: "Next.js",
    db: "PostgreSQL",
    orm: "Prisma",
    style: "Tailwind CSS",
    test: "Vitest",
    extra: [],
    mcp: ["filesystem"],
    aiTools: ["cursor", "claude-code"],
    thirdPartySkills: ["vercel-labs/agent-skills", "anthropics/skills/frontend-design"],
  }, "/tmp/demo-app");

  assert.deepEqual(answers.aiTools, ["cursor", "claude-code"]);
  assert.deepEqual(answers.thirdPartySkills, [
    "vercel-labs/agent-skills",
    "anthropics/skills/frontend-design",
  ]);
});

test("buildGeneratedFiles 在有第三方 skills 时生成安装指南", () => {
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
    mcpServers: ["filesystem"],
    aiTools: ["cursor", "claude-code"],
    thirdPartySkills: ["vercel-labs/agent-skills", "anthropics/skills/frontend-design"],
    projectPath: "/tmp/demo-app",
  });

  const guide = files.find((entry) => entry.path === "docs/ai-skills/external/skills-sh.md");
  assert.ok(guide);
  assert.match(guide.content, /vercel-labs\/agent-skills/);
  assert.match(guide.content, /npx skills add anthropics\/skills\/frontend-design/);
});

test("buildThirdPartySkillInstallPlan 生成可执行命令列表", () => {
  const plan = buildThirdPartySkillInstallPlan(["vercel-labs/agent-skills", "anthropics/skills/frontend-design"]);
  assert.equal(plan.length, 2);
  assert.equal(plan[0].command, "npx skills add vercel-labs/agent-skills");
});
