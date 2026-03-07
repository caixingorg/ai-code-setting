const test = require("node:test");
const assert = require("node:assert/strict");

const { parseArgv } = require("../../src/cli");
const { buildHelpText } = require("../../src/constants");

test("parseArgv 解析 yes force config 和重复列表参数", () => {
  const result = parseArgv([
    "--yes",
    "--force",
    "--dry-run",
    "--config",
    "./demo.json",
    "--extra",
    "a,b",
    "--extra",
    "c",
    "--mcp=filesystem,git",
    "--ai-tool",
    "cursor,claude-code",
    "--ai-tool-preset",
    "terminal",
    "--third-party-skill",
    "vercel-labs/agent-skills,anthropics/skills/frontend-design",
    "--third-party-skill-preset",
    "frontend,review",
    "--install-third-party-skills",
  ]);

  assert.equal(result.flags.yes, true);
  assert.equal(result.flags.force, true);
  assert.equal(result.flags.dryRun, true);
  assert.equal(result.values.config, "./demo.json");
  assert.deepEqual(result.values.extra, ["a", "b", "c"]);
  assert.deepEqual(result.values.mcp, ["filesystem", "git"]);
  assert.deepEqual(result.values.aiTool, ["cursor", "claude-code"]);
  assert.deepEqual(result.values.aiToolPreset, ["terminal"]);
  assert.deepEqual(result.values.thirdPartySkill, ["vercel-labs/agent-skills", "anthropics/skills/frontend-design"]);
  assert.deepEqual(result.values.thirdPartySkillPreset, ["frontend", "review"]);
  assert.equal(result.flags.installThirdPartySkills, true);
});

test("buildHelpText 包含 dry-run 参数说明", () => {
  assert.match(buildHelpText(), /--dry-run/);
  assert.match(buildHelpText(), /--ai-tool/);
});
