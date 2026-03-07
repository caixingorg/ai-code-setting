const readline = require("readline");

const {
  AI_TOOL_OPTIONS,
  DATABASE_OPTIONS,
  EXTRA_OPTIONS,
  FRAMEWORK_OPTIONS,
  MCP_CATALOG,
  STYLE_OPTIONS,
  getAvailableMcpKeys,
  getFrameworkOptions,
  getOrmOptions,
  getTestOptions,
  isFrontendFramework,
  isPrimaryDatabase,
} = require("../constants");
const { writeLine } = require("./output");

/**
 * Create the interactive prompt adapter used only when the CLI runs in TTY mode.
 */
function createPromptIO({ stdin, stdout, colors }) {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
  }

  async function input(question, defaultValue = "") {
    const hint = defaultValue ? colors.dim(` [默认: ${defaultValue}]`) : "";
    const answer = await ask(`\n${colors.bold(question)}${hint}: `);
    return answer.trim() || defaultValue;
  }

  async function confirm(question, defaultValue = false) {
    const suffix = defaultValue ? "[Y/n]" : "[y/N]";
    const answer = (await ask(`\n${colors.bold(question)} ${colors.dim(`${suffix}：`)} `)).trim().toLowerCase();
    if (!answer) {
      return defaultValue;
    }
    return ["y", "yes"].includes(answer);
  }

  async function select(question, options, defaultValue) {
    const defaultIndex = Math.max(0, options.findIndex((option) => option === defaultValue));

    writeLine(stdout, `\n${colors.bold(question)}`);
    options.forEach((option, index) => {
      const marker = index === defaultIndex ? colors.green("▶") : colors.dim(" ");
      writeLine(stdout, `  ${marker} ${colors.cyan(String(index + 1))}. ${option}`);
    });

    const answer = await ask(`  ${colors.dim(`输入序号 [默认 ${defaultIndex + 1}]：`)} `);
    const selectedIndex = Number.parseInt(answer.trim(), 10) - 1;
    return selectedIndex >= 0 && selectedIndex < options.length ? options[selectedIndex] : options[defaultIndex];
  }

  async function multiSelect(question, options, selectedValues = []) {
    const defaultIndexes = options
      .map((option, index) => selectedValues.includes(option) ? index + 1 : null)
      .filter(Boolean);

    writeLine(stdout, `\n${colors.bold(question)} ${colors.dim("(多选，用逗号分隔；直接回车保留默认选择)")}`);
    options.forEach((option, index) => {
      const mark = selectedValues.includes(option) ? colors.green("✓") : colors.dim(" ");
      writeLine(stdout, `  ${mark} ${colors.cyan(String(index + 1))}. ${option}`);
    });

    const placeholder = defaultIndexes.length > 0 ? ` [默认 ${defaultIndexes.join(",")}]` : " [默认全空]";
    const answer = await ask(`  ${colors.dim(`输入序号${placeholder}：`)} `);

    if (!answer.trim()) {
      return selectedValues;
    }

    const indexes = answer
      .split(",")
      .map((value) => Number.parseInt(value.trim(), 10) - 1)
      .filter((index) => index >= 0 && index < options.length);

    return [...new Set(indexes.map((index) => options[index]))];
  }

  function close() {
    rl.close();
  }

  return { ask, close, confirm, input, multiSelect, select };
}

/**
 * Ask the remaining project questions interactively, seeded with normalized defaults.
 */
async function collectInteractiveAnswers(initialAnswers, prompt) {
  const projectName = await prompt.input("项目名称", initialAnswers.projectName);
  const lang = await prompt.select("主要编程语言", Object.keys(FRAMEWORK_OPTIONS), initialAnswers.lang);
  const framework = await prompt.select("使用的框架", getFrameworkOptions(lang), initialAnswers.framework);
  const db = await prompt.select("数据库", DATABASE_OPTIONS, initialAnswers.db);

  let orm = "none";
  if (isPrimaryDatabase(db)) {
    const ormOptions = getOrmOptions(db);
    const ormDefault = initialAnswers.orm === "none" ? ormOptions[ormOptions.length - 1] : initialAnswers.orm;
    const selectedOrm = await prompt.select("ORM / 数据库客户端", ormOptions, ormDefault);
    orm = selectedOrm.includes("裸") || selectedOrm.includes("无") ? "none" : selectedOrm;
  }

  const frameworkFrontend = isFrontendFramework(framework);
  const hasFrontend = frameworkFrontend
    ? true
    : await prompt.confirm("是否有前端部分？", initialAnswers.isFrontend);

  let style = "none";
  if (hasFrontend) {
    const styleDefault = initialAnswers.style === "none" ? "无特定方案" : initialAnswers.style;
    const selectedStyle = await prompt.select("样式方案", STYLE_OPTIONS, styleDefault);
    style = selectedStyle === "无特定方案" ? "none" : selectedStyle;
  }

  const test = await prompt.select("测试框架", getTestOptions(lang), initialAnswers.test);
  const extra = await prompt.multiSelect("团队附加规范（多选）", EXTRA_OPTIONS, initialAnswers.extra);

  const availableMcpKeys = getAvailableMcpKeys({ db, isFrontend: hasFrontend });
  const mcpLabels = availableMcpKeys.map((key) => MCP_CATALOG[key]);
  const defaultMcpLabels = initialAnswers.mcpServers.map((key) => MCP_CATALOG[key]).filter(Boolean);
  const selectedMcpLabels = await prompt.multiSelect("启用哪些 MCP Server（多选）", mcpLabels, defaultMcpLabels);
  const mcpServers = availableMcpKeys.filter((key) => selectedMcpLabels.includes(MCP_CATALOG[key]));

  const aiToolKeys = Object.keys(AI_TOOL_OPTIONS);
  const aiToolLabels = aiToolKeys.map((key) => AI_TOOL_OPTIONS[key]);
  const defaultAiToolLabels = (initialAnswers.aiTools || []).map((key) => AI_TOOL_OPTIONS[key]).filter(Boolean);
  const selectedAiToolLabels = await prompt.multiSelect("需要生成哪些 AI 编程工具配置（多选）", aiToolLabels, defaultAiToolLabels);
  const aiTools = aiToolKeys.filter((key) => selectedAiToolLabels.includes(AI_TOOL_OPTIONS[key]));

  return {
    projectName,
    lang,
    framework,
    db,
    orm,
    style,
    test,
    extra,
    isFrontend: hasFrontend,
    mcpServers,
    aiTools,
    aiToolPresets: initialAnswers.aiToolPresets || [],
    thirdPartySkills: initialAnswers.thirdPartySkills || [],
    thirdPartySkillPresets: initialAnswers.thirdPartySkillPresets || [],
    projectPath: initialAnswers.projectPath,
  };
}

module.exports = {
  collectInteractiveAnswers,
  createPromptIO,
};
