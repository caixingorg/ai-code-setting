const test = require("node:test");
const assert = require("node:assert/strict");

const { readTemplate, renderTemplate } = require("../../src/templates/renderer");
const { genAgentRules, genProjectRules } = require("../../src/templates");

test("readTemplate 读取静态 markdown 模板", () => {
  const content = readTemplate("rules/agent.md");
  assert.match(content, /Agent 自主执行规范 Rules/);
});

test("renderTemplate 能渲染占位符", () => {
  const content = renderTemplate("readme/section.md", { projectName: "demo-app" });
  assert.match(content, /demo-app/);
});

test("genProjectRules 基于静态模板生成动态 rules", () => {
  const content = genProjectRules({
    projectName: "demo-app",
    lang: "TypeScript",
    framework: "Next.js",
    db: "PostgreSQL",
    orm: "Prisma",
    style: "Tailwind CSS",
    test: "Vitest",
    extra: ["使用 Conventional Commits 规范提交信息"],
  });

  assert.match(content, /demo-app/);
  assert.match(content, /Tailwind CSS/);
  assert.match(content, /Conventional Commits/);
});

test("genAgentRules 直接返回静态模板内容", () => {
  const content = genAgentRules();
  assert.match(content, /绝对禁止/);
});
