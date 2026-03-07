const { buildGeneratedFiles, genGitignoreBlock, genMCPConfig, genReadmeSection } = require("./integrations");
const {
  genAgentRules,
  genGoRules,
  genNextjsRules,
  genPrismaRules,
  genProjectRules,
  genPythonRules,
  genReactRules,
} = require("./rules");
const {
  genSecuritySkill,
  genSkillCodeReview,
  genSkillDebug,
  genSkillGenTests,
  genSkillNewFeature,
  genSkillPRDToDesign,
  genSkillRefactor,
  genThirdPartySkillsGuide,
} = require("./skills");

module.exports = {
  buildGeneratedFiles,
  genAgentRules,
  genGitignoreBlock,
  genGoRules,
  genMCPConfig,
  genNextjsRules,
  genPrismaRules,
  genProjectRules,
  genPythonRules,
  genReactRules,
  genReadmeSection,
  genSecuritySkill,
  genSkillCodeReview,
  genSkillDebug,
  genSkillGenTests,
  genSkillNewFeature,
  genSkillPRDToDesign,
  genSkillRefactor,
  genThirdPartySkillsGuide,
};
