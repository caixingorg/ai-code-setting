const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { resolveRuntimeOptions } = require("../../src/index");

test("resolveRuntimeOptions 合并配置文件与命令行参数", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-sop-config-"));
  const configPath = path.join(tempDir, "ai-sop.config.json");
  fs.writeFileSync(configPath, JSON.stringify({
    lang: "JavaScript",
    framework: "Next.js",
    db: "PostgreSQL",
    orm: "Prisma",
    style: "Tailwind CSS",
    test: "Vitest",
    extra: ["使用 Conventional Commits 规范提交信息"],
    mcp: ["filesystem", "git"],
    aiTools: ["cursor", "claude-code"],
    aiToolPresets: ["terminal"],
    thirdPartySkills: ["vercel-labs/agent-skills"],
    thirdPartySkillPresets: ["frontend"]
  }, null, 2));

  const result = await resolveRuntimeOptions({
    argv: ["--config", configPath, "--project-name", "demo-app", "--yes", "--mcp", "github", "--ai-tool", "github-copilot", "--third-party-skill", "anthropics/skills/frontend-design"],
    cwd: tempDir,
    stdin: { isTTY: false },
    stdout: { isTTY: false, write() {} },
  });

  assert.equal(result.flags.yes, true);
  assert.equal(result.answers.projectName, "demo-app");
  assert.equal(result.answers.lang, "JavaScript");
  assert.equal(result.answers.framework, "Next.js");
  assert.deepEqual(result.answers.mcpServers, ["filesystem", "git", "github"]);
  assert.match(result.answers.aiTools.join(","), /cursor/);
  assert.match(result.answers.aiTools.join(","), /claude-code/);
  assert.match(result.answers.aiTools.join(","), /github-copilot/);
  assert.match(result.answers.aiTools.join(","), /gemini-cli/);
  assert.match(result.answers.aiTools.join(","), /openai-codex/);
  assert.match(result.answers.aiTools.join(","), /antigravity/);
  assert.deepEqual(result.answers.aiToolPresets, ["terminal"]);
  assert.match(result.answers.thirdPartySkills.join(","), /vercel-labs\/agent-skills/);
  assert.match(result.answers.thirdPartySkills.join(","), /anthropics\/skills\/frontend-design/);
  assert.deepEqual(result.answers.thirdPartySkillPresets, ["frontend"]);
});

test("resolveRuntimeOptions 对非法选项值直接报错", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-sop-invalid-"));

  await assert.rejects(
    () => resolveRuntimeOptions({
      argv: ["--yes", "--lang", "Ruby"],
      cwd: tempDir,
      stdin: { isTTY: false },
      stdout: { isTTY: false, write() {} },
    }),
    /无效的 lang/
  );
});
