const path = require("path");

const { parseArgv } = require("./cli");
const { loadConfigFile, mergeRawOptions, normalizeAnswers } = require("./config");
const { PACKAGE_INFO, buildHelpText, createColors } = require("./constants");
const { runInitCommand } = require("./commands/init");
const { runValidateConfigCommand } = require("./commands/validate-config");
const { collectInteractiveAnswers, createPromptIO } = require("./services/prompt");
const { createBanner, writeLine } = require("./services/output");

/**
 * Resolve the final runtime answers by merging defaults, config file values, CLI overrides and prompts.
 */
async function resolveRuntimeOptions({ argv, parsedArgs, cwd, stdin, stdout, allowInteractive = true }) {
  const parsed = parsedArgs || parseArgv(argv);
  const effectiveCwd = path.resolve(parsed.values.cwd || cwd);
  const fileConfig = loadConfigFile(parsed.values.config, effectiveCwd);
  const mergedRawOptions = mergeRawOptions(fileConfig, parsed.values);
  let answers = normalizeAnswers(mergedRawOptions, effectiveCwd);

  const interactive = Boolean(allowInteractive && stdin.isTTY && stdout.isTTY && !parsed.flags.yes && !parsed.flags.nonInteractive);
  if (interactive) {
    const prompt = createPromptIO({ stdin, stdout, colors: createColors(parsed.flags.color) });
    try {
      answers = await collectInteractiveAnswers(answers, prompt);
    } finally {
      prompt.close();
    }
  }

  return {
    answers,
    flags: parsed.flags,
    cwd: effectiveCwd,
    interactive,
  };
}

/**
 * Dispatch argv to the corresponding command implementation.
 */
async function executeCommand({ parsed, argv, cwd, stdin, stdout, stderr, colors }) {
  const command = parsed.positionals[0] || "init";

  if (!["init", "validate-config"].includes(command)) {
    writeLine(stderr, `错误：未知命令 ${command}`);
    writeLine(stderr, "使用 --help 查看可用命令。");
    return 1;
  }

  const allowInteractive = command === "init";
  const { answers, flags, interactive, cwd: runtimeCwd } = await resolveRuntimeOptions({
    argv,
    parsedArgs: parsed,
    cwd,
    stdin,
    stdout,
    allowInteractive,
  });

  writeLine(stdout, `  ${colors.blue("📁 目标目录：")} ${colors.cyan(runtimeCwd)}\n`);

  if (command === "validate-config") {
    return runValidateConfigCommand({ answers, colors, flags, interactive, runtimeCwd, stdin, stdout, stderr });
  }

  return runInitCommand({
    answers,
    colors,
    flags,
    interactive,
    runtimeCwd,
    stdin,
    stdout,
    stderr,
    installThirdPartySkillsExecutor: parsed.installThirdPartySkillsExecutor,
  });
}

/**
 * Execute the CLI command end-to-end and return a process exit code.
 */
async function runCli(options = {}) {
  const argv = options.argv || process.argv.slice(2);
  const cwd = path.resolve(options.cwd || process.cwd());
  const stdin = options.stdin || process.stdin;
  const stdout = options.stdout || process.stdout;
  const stderr = options.stderr || process.stderr;

  let parsed;
  try {
    parsed = parseArgv(argv);
  } catch (error) {
    writeLine(stderr, `错误：${error.message}`);
    writeLine(stderr, "使用 --help 查看参数说明。");
    return 1;
  }

  if (parsed.flags.help) {
    writeLine(stdout, buildHelpText(options.binName || "ai-sop-setup"));
    return 0;
  }

  if (parsed.flags.version) {
    writeLine(stdout, PACKAGE_INFO.version);
    return 0;
  }

  const colors = createColors(parsed.flags.color && Boolean(stdout.isTTY ?? true));

  try {
    if (stdout.isTTY) {
      stdout.write("\x1Bc");
      writeLine(stdout, createBanner(colors));
      writeLine(stdout, colors.dim("  将在目标目录生成完整的 AI 辅助开发配置文件\n"));
    }

    parsed.installThirdPartySkillsExecutor = options.installThirdPartySkillsExecutor;
    return executeCommand({ parsed, argv, cwd, stdin, stdout, stderr, colors });
  } catch (error) {
    writeLine(stderr, `错误：${error.message}`);
    return 1;
  }
}

/**
 * Process entrypoint used by the published bin script.
 */
async function main() {
  const code = await runCli();
  process.exit(code);
}

module.exports = {
  executeCommand,
  main,
  resolveRuntimeOptions,
  runCli,
};
