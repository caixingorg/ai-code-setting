const { readTemplate, renderTemplate } = require("./renderer");

/**
 * Generate the feature implementation prompt template.
 */
function genSkillNewFeature(cfg) {
  const { framework, db, orm, test } = cfg;
  const isNext = framework.toLowerCase().includes("next");

  const apiPath = isNext ? "app/api/[resource]/route.ts" : "src/routes/[resource].route.ts";
  const servicePath = isNext ? "lib/services/[resource]Service.ts" : "src/services/[resource].service.ts";

  return renderTemplate("skills/new-feature.md", {
    apiPath,
    frontendStep: isNext ? "6. 前端组件（如涉及）" : "",
    migrationStep: db !== "none"
      ? `1. ${orm !== "none" ? `${orm} Schema/Migration 变更` : "数据库 Schema 变更"}`
      : "",
    servicePath,
    test,
  });
}

/**
 * Generate the bug analysis prompt template.
 */
function genSkillDebug() {
  return readTemplate("skills/debug.md");
}

/**
 * Generate the code review prompt template.
 */
function genSkillCodeReview() {
  return readTemplate("skills/code-review.md");
}

/**
 * Generate the PRD-to-design prompt template.
 */
function genSkillPRDToDesign() {
  return readTemplate("skills/prd-to-design.md");
}

/**
 * Generate the refactor prompt template.
 */
function genSkillRefactor() {
  return readTemplate("skills/refactor.md");
}

/**
 * Generate the test generation prompt template.
 */
function genSkillGenTests() {
  return readTemplate("skills/gen-tests.md");
}

/**
 * Generate the security review prompt template.
 */
function genSecuritySkill() {
  return readTemplate("skills/security.md");
}

/**
 * Generate the third-party skills integration guide.
 */
function genThirdPartySkillsGuide(cfg) {
  const skills = cfg.thirdPartySkills || [];
  const skillsList = skills.map((entry) => `- ${entry}`).join("\n");
  const installCommands = skills.map((entry) => `npx skills add ${entry}`).join("\n");

  return renderTemplate("skills/skills-sh.md", {
    installCommands,
    skillsList,
  });
}

module.exports = {
  genThirdPartySkillsGuide,
  genSecuritySkill,
  genSkillCodeReview,
  genSkillDebug,
  genSkillGenTests,
  genSkillNewFeature,
  genSkillPRDToDesign,
  genSkillRefactor,
};
