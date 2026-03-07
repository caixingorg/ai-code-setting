const { AI_TOOL_OPTIONS } = require("../constants");

/**
 * Write one line to a stream to keep stdout/stderr handling consistent.
 */
function writeLine(stream, message = "") {
  stream.write(`${message}\n`);
}

/**
 * Render the startup banner separately so it can be toggled in non-TTY environments.
 */
function createBanner(colors) {
  const { raw } = colors;
  return [
    "",
    `${raw.bold}${raw.bgBlue}                                                    ${raw.reset}`,
    `${raw.bold}${raw.bgBlue}   🤖  AI 编程 SOP 一键配置 CLI                     ${raw.reset}`,
    `${raw.bold}${raw.bgBlue}   Rules · Skills · MCP · Workflow                  ${raw.reset}`,
    `${raw.bold}${raw.bgBlue}                                                    ${raw.reset}`,
    "",
  ].join("\n");
}

/**
 * Render the completion summary shown after either a real execution or a dry run.
 */
function renderSummary(colors, createdEntries, answers) {
  const instructionFiles = [];
  if ((answers.aiTools || []).includes("cursor")) {
    instructionFiles.push(".cursor/rules/");
  }
  if ((answers.aiTools || []).includes("claude-code")) {
    instructionFiles.push("CLAUDE.md");
  }
  if ((answers.aiTools || []).includes("github-copilot")) {
    instructionFiles.push(".github/copilot-instructions.md");
  }
  if ((answers.aiTools || []).includes("gemini-cli")) {
    instructionFiles.push("GEMINI.md");
  }
  if ((answers.aiTools || []).includes("openai-codex")) {
    instructionFiles.push("AGENTS.md");
  }
  if ((answers.aiTools || []).includes("antigravity") && !instructionFiles.includes("AGENTS.md")) {
    instructionFiles.push("AGENTS.md");
  }

  const primaryInstructionTarget = instructionFiles.length > 0 ? instructionFiles.join("、") : "生成的 AI 配置文件";
  const mcpStep = (answers.aiTools || []).includes("cursor")
    ? "复制 .cursor/mcp.json.example 为 .cursor/mcp.json，并填入真实密钥"
    : "按目标工具的方式导入 .ai-sop/mcp.json.example 中的 MCP 配置";

  return [
    "",
    `${colors.bold(colors.green(`  ✅ 配置完成！共处理 ${createdEntries.length} 个写入动作`))}`,
    "",
    colors.bold("─────────────────────────────────────"),
    colors.bold("  📋 接下来的步骤："),
    "",
    `  ${colors.cyan("1.")} 检查 ${primaryInstructionTarget}，确认技术栈规则准确`,
    `  ${colors.cyan("2.")} ${mcpStep}`,
    `  ${colors.cyan("3.")} 将 Rules / Skills / README 变更纳入版本控制`,
    `  ${colors.cyan("4.")} 在 ${((answers.aiTools || []).map((key) => AI_TOOL_OPTIONS[key]).filter(Boolean).join(" / ")) || "目标 AI 工具"} 中重新打开项目，让配置立即生效`,
    "",
    `  ${colors.dim(`项目：${answers.projectName}  |  目录：${answers.projectPath}`)}`,
  ].join("\n");
}

/**
 * Render the normalized configuration summary for the validation command.
 */
function renderValidationSummary(colors, answers) {
  const extra = answers.extra.length > 0 ? answers.extra.join("；") : "无";
  const mcpServers = answers.mcpServers.length > 0 ? answers.mcpServers.join(", ") : "无";
  const aiTools = answers.aiTools.length > 0 ? answers.aiTools.join(", ") : "无";
  const aiToolPresets = answers.aiToolPresets.length > 0 ? answers.aiToolPresets.join(", ") : "无";
  const thirdPartySkillPresets = answers.thirdPartySkillPresets.length > 0 ? answers.thirdPartySkillPresets.join(", ") : "无";
  const thirdPartySkills = answers.thirdPartySkills.length > 0 ? answers.thirdPartySkills.join(", ") : "无";

  return [
    "",
    colors.bold("配置校验通过"),
    colors.bold("─────────────────────────────────────"),
    `项目名：${answers.projectName}`,
    `语言：${answers.lang}`,
    `框架：${answers.framework}`,
    `数据库：${answers.db}`,
    `ORM：${answers.orm}`,
    `样式：${answers.style}`,
    `测试：${answers.test}`,
    `前端：${answers.isFrontend ? "是" : "否"}`,
    `附加规范：${extra}`,
    `MCP：${mcpServers}`,
    `AI 工具预设：${aiToolPresets}`,
    `AI 工具：${aiTools}`,
    `第三方 Skills 预设：${thirdPartySkillPresets}`,
    `第三方 Skills：${thirdPartySkills}`,
    `目录：${answers.projectPath}`,
  ].join("\n");
}

/**
 * Render third-party skills install results for either dry-run or executed mode.
 */
function renderThirdPartySkillInstallSummary(colors, plan, dryRun) {
  const title = dryRun ? "第三方 Skills 安装预览" : "第三方 Skills 安装结果";
  const lines = ["", colors.bold(title), colors.bold("─────────────────────────────────────")];

  if (plan.length === 0) {
    lines.push("无第三方 Skills 安装动作");
    return lines.join("\n");
  }

  for (const item of plan) {
    lines.push(`${dryRun ? colors.cyan("•") : colors.green("✓")} ${item.command}`);
  }

  return lines.join("\n");
}

module.exports = {
  createBanner,
  renderSummary,
  renderThirdPartySkillInstallSummary,
  renderValidationSummary,
  writeLine,
};
