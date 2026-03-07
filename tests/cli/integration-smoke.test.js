const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { runCli } = require("../../src/index");

function createBufferStream() {
  let output = "";
  return {
    isTTY: false,
    write(chunk) {
      output += String(chunk);
    },
    toString() {
      return output;
    },
  };
}

test("runCli 在非交互模式生成核心文件", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-sop-run-"));
  const stdout = createBufferStream();
  const stderr = createBufferStream();

  const exitCode = await runCli({
    argv: [
      "--yes",
      "--project-name",
      "demo-app",
      "--lang",
      "TypeScript",
      "--framework",
      "Next.js",
      "--db",
      "PostgreSQL",
      "--orm",
      "Prisma",
      "--style",
      "Tailwind CSS",
      "--test",
      "Vitest",
      "--mcp",
      "filesystem,git,github,browsertools",
      "--ai-tool-preset",
      "all-major",
      "--third-party-skill",
      "vercel-labs/agent-skills",
    ],
    cwd: tempDir,
    stdin: { isTTY: false },
    stdout,
    stderr,
  });

  assert.equal(exitCode, 0, stderr.toString());
  assert.equal(fs.existsSync(path.join(tempDir, ".cursor/rules/project.mdc")), true);
  assert.equal(fs.existsSync(path.join(tempDir, ".cursor/rules/nextjs.mdc")), true);
  assert.equal(fs.existsSync(path.join(tempDir, ".cursor/mcp.json.example")), true);
  assert.equal(fs.existsSync(path.join(tempDir, ".ai-sop/mcp.json.example")), true);
  assert.equal(fs.existsSync(path.join(tempDir, "CLAUDE.md")), true);
  assert.equal(fs.existsSync(path.join(tempDir, ".github/copilot-instructions.md")), true);
  assert.equal(fs.existsSync(path.join(tempDir, "GEMINI.md")), true);
  assert.equal(fs.existsSync(path.join(tempDir, "AGENTS.md")), true);
  assert.equal(fs.existsSync(path.join(tempDir, "docs/ai-skills/external/skills-sh.md")), true);
  assert.match(stdout.toString(), /配置完成/);
});

test("runCli 在 dry-run 模式下只预览不写入", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-sop-dry-run-"));
  const stdout = createBufferStream();
  const stderr = createBufferStream();

  const exitCode = await runCli({
    argv: [
      "--yes",
      "--dry-run",
      "--project-name",
      "demo-app",
      "--lang",
      "TypeScript",
      "--framework",
      "Next.js",
      "--db",
      "PostgreSQL",
      "--orm",
      "Prisma",
      "--style",
      "Tailwind CSS",
      "--test",
      "Vitest",
    ],
    cwd: tempDir,
    stdin: { isTTY: false },
    stdout,
    stderr,
  });

  assert.equal(exitCode, 0, stderr.toString());
  assert.equal(fs.existsSync(path.join(tempDir, ".cursor/rules/project.mdc")), false);
  assert.match(stdout.toString(), /Dry Run/);
  assert.match(stdout.toString(), /would write/);
});

test("runCli 支持 validate-config 命令", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-sop-validate-"));
  const stdout = createBufferStream();
  const stderr = createBufferStream();

  const exitCode = await runCli({
    argv: [
      "validate-config",
      "--project-name",
      "demo-app",
      "--lang",
      "TypeScript",
      "--framework",
      "Next.js",
      "--db",
      "PostgreSQL",
      "--orm",
      "Prisma",
      "--style",
      "Tailwind CSS",
      "--test",
      "Vitest",
      "--mcp",
      "filesystem,git",
    ],
    cwd: tempDir,
    stdin: { isTTY: false },
    stdout,
    stderr,
  });

  assert.equal(exitCode, 0, stderr.toString());
  assert.match(stdout.toString(), /配置校验通过/);
  assert.equal(fs.existsSync(path.join(tempDir, ".cursor/rules/project.mdc")), false);
});

test("runCli 在显式开启时执行第三方 skills 安装计划", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-sop-install-skills-"));
  const stdout = createBufferStream();
  const stderr = createBufferStream();
  const executed = [];

  const exitCode = await runCli({
    argv: [
      "--yes",
      "--project-name",
      "demo-app",
      "--lang",
      "TypeScript",
      "--framework",
      "Next.js",
      "--db",
      "PostgreSQL",
      "--orm",
      "Prisma",
      "--style",
      "Tailwind CSS",
      "--test",
      "Vitest",
      "--third-party-skill-preset",
      "frontend",
      "--install-third-party-skills",
    ],
    cwd: tempDir,
    stdin: { isTTY: false },
    stdout,
    stderr,
    installThirdPartySkillsExecutor(item) {
      executed.push(item.command);
    },
  });

  assert.equal(exitCode, 0, stderr.toString());
  assert.ok(executed.length >= 1);
  assert.match(executed.join("\n"), /npx skills add/);
});
