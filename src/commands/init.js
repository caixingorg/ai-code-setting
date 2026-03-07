const path = require("path");

const { buildGeneratedFiles, genGitignoreBlock, genReadmeSection } = require("../templates");
const { MANAGED_BLOCKS } = require("../constants");
const { findExistingFiles, getManagedBlockAction, upsertManagedBlock, writeTextFile } = require("../fs-utils");
const { createPromptIO } = require("../services/prompt");
const { renderSummary, renderThirdPartySkillInstallSummary, writeLine } = require("../services/output");
const { buildThirdPartySkillInstallPlan, installThirdPartySkills } = require("../services/third-party-skills");

/**
 * Execute the default init workflow that writes rules, skills and MCP config files.
 */
async function runInitCommand(context) {
  const { answers, colors, flags, interactive, runtimeCwd, stdin, stdout, installThirdPartySkillsExecutor } = context;
  const generatedFiles = buildGeneratedFiles(answers);
  const existingFiles = findExistingFiles(runtimeCwd, generatedFiles.map((entry) => entry.path));

  if (existingFiles.length > 0 && !flags.force && !flags.yes && !flags.dryRun) {
    if (!interactive) {
      throw new Error(`检测到已存在文件：${existingFiles.join(", ")}。请使用 --force 或 --yes。`);
    }

    const prompt = createPromptIO({ stdin, stdout, colors });
    try {
      writeLine(stdout, `${colors.yellow("⚠")} 检测到以下文件已存在，继续将被覆盖：`);
      existingFiles.forEach((filePath) => writeLine(stdout, `  ${colors.dim("-")} ${filePath}`));
      const confirmed = await prompt.confirm("是否继续覆盖上述文件？", false);
      if (!confirmed) {
        writeLine(stdout, `\n${colors.yellow("已取消")}：未写入任何文件。`);
        return 0;
      }
    } finally {
      prompt.close();
    }
  }

  writeLine(stdout, `\n${colors.bold("─────────────────────────────────────")}`);
  writeLine(stdout, colors.bold(flags.dryRun ? "  🔍 Dry Run：预览将要执行的写入动作...\n" : "  📝 正在生成配置文件...\n"));

  const createdEntries = [];
  for (const entry of generatedFiles) {
    if (flags.dryRun) {
      createdEntries.push(`${entry.path} (would write)`);
      writeLine(stdout, `  ${colors.cyan("•")} ${entry.path} ${colors.dim("(would write)")}`);
      continue;
    }

    writeTextFile(path.join(runtimeCwd, entry.path), entry.content);
    createdEntries.push(entry.path);
    writeLine(stdout, `  ${colors.green("✓")} ${entry.path}`);
  }

  const gitignorePath = path.join(runtimeCwd, ".gitignore");
  const gitignoreResult = flags.dryRun
    ? getManagedBlockAction(gitignorePath, MANAGED_BLOCKS.gitignore)
    : upsertManagedBlock(gitignorePath, MANAGED_BLOCKS.gitignore, genGitignoreBlock());

  if (gitignoreResult !== "unchanged") {
    createdEntries.push(`.gitignore (${flags.dryRun ? `would ${gitignoreResult}` : gitignoreResult})`);
    writeLine(stdout, `  ${flags.dryRun ? colors.cyan("•") : colors.green("✓")} .gitignore (${flags.dryRun ? `would ${gitignoreResult}` : gitignoreResult})`);
  } else {
    writeLine(stdout, `  ${colors.dim("○")} .gitignore 已是最新状态`);
  }

  const readmePath = path.join(runtimeCwd, "README.md");
  const readmeResult = flags.dryRun
    ? getManagedBlockAction(readmePath, MANAGED_BLOCKS.readme)
    : upsertManagedBlock(readmePath, MANAGED_BLOCKS.readme, genReadmeSection(answers), `# ${answers.projectName}`);

  if (readmeResult !== "unchanged") {
    createdEntries.push(`README.md (${flags.dryRun ? `would ${readmeResult}` : readmeResult})`);
    writeLine(stdout, `  ${flags.dryRun ? colors.cyan("•") : colors.green("✓")} README.md (${flags.dryRun ? `would ${readmeResult}` : readmeResult})`);
  } else {
    writeLine(stdout, `  ${colors.dim("○")} README.md 已是最新状态`);
  }

  const installPlan = buildThirdPartySkillInstallPlan(answers.thirdPartySkills);
  if (flags.installThirdPartySkills || flags.dryRun) {
    writeLine(stdout, renderThirdPartySkillInstallSummary(colors, installPlan, flags.dryRun));
  }

  if (flags.installThirdPartySkills && !flags.dryRun && installPlan.length > 0) {
    installThirdPartySkills(installPlan, {
      cwd: runtimeCwd,
      executor: installThirdPartySkillsExecutor,
    });
  }

  writeLine(stdout, renderSummary(colors, createdEntries, answers));
  return 0;
}

module.exports = {
  runInitCommand,
};
