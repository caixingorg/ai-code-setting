const { spawnSync } = require("child_process");

/**
 * Build a normalized install plan for third-party skills.sh packages.
 */
function buildThirdPartySkillInstallPlan(skills) {
  return (skills || []).map((id) => ({
    id,
    command: `npx skills add ${id}`,
    executable: "npx",
    args: ["skills", "add", id],
  }));
}

/**
 * Execute the third-party skills install plan sequentially.
 */
function installThirdPartySkills(plan, options = {}) {
  const executor = options.executor || defaultExecutor;

  for (const item of plan) {
    executor(item, options);
  }
}

function defaultExecutor(item, options = {}) {
  const result = spawnSync(item.executable, item.args, {
    cwd: options.cwd,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`第三方 Skills 安装失败：${item.command}`);
  }
}

module.exports = {
  buildThirdPartySkillInstallPlan,
  installThirdPartySkills,
};
