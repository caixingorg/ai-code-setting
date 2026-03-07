# ai-sop-setup

将单次使用的 AI SOP 初始化脚本升级为可发布、可复用的 Node.js CLI。

[中文](README.md) | [English](README.en.md)

- 仓库地址：[caixingorg/ai-code-setting](https://github.com/caixingorg/ai-code-setting)
- 问题反馈：[Issues](https://github.com/caixingorg/ai-code-setting/issues)

## 项目状态

- 当前适合以早期公开项目方式发布
- 已覆盖核心 CLI 行为、非交互参数、dry-run、多 AI 工具配置生成
- 仍建议在正式大范围推广前补齐仓库地址、问题反馈地址与发布流水线徽章

## 安装

### 本地开发

- `npm install`
- `npm run test:ci`

### 全局安装

- `npm install -g ai-sop-setup`
- `ai-sop-setup --help`

## 快速开始

1. 在目标项目目录安装或直接运行本工具
2. 执行 `ai-sop-setup --yes --ai-tool-preset all-major`
3. 检查生成的 AI 规则文件、README 更新块与 MCP 示例配置
4. 如需预览而不落盘，先执行 `ai-sop-setup --yes --dry-run`

### 常见输出文件

- `.cursor/rules/*.mdc`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `GEMINI.md`
- `AGENTS.md`
- `.ai-sop/mcp.json.example`

## 用法

- `ai-sop-setup`
- `ai-sop-setup init`
- `ai-sop-setup validate-config --config ./ai-sop.config.json`
- `ai-sop-setup --yes --force`
- `ai-sop-setup --yes --dry-run`
- `ai-sop-setup --config ./ai-sop.config.json`
- `ai-sop-setup --lang TypeScript --framework Next.js --db PostgreSQL --orm Prisma`
- `ai-sop-setup --ai-tool cursor --ai-tool claude-code --ai-tool github-copilot`
- `ai-sop-setup --ai-tool-preset all-major`
- `ai-sop-setup --third-party-skill vercel-labs/agent-skills --third-party-skill anthropics/skills/frontend-design`
- `ai-sop-setup --third-party-skill-preset frontend --install-third-party-skills`

## 参数行为说明

- 非法的 `--lang`、`--framework`、`--db`、`--orm`、`--style`、`--test` 值会直接报错，不再静默回退默认值
- `--dry-run` 只预览将生成/更新哪些文件，不会真正写入磁盘
- `validate-config` 命令只做配置校验与归一化展示，不会进入交互，也不会写文件
- `--config` 支持 `.json`、`.jsonc`、`.js`、`.cjs`
- `--ai-tool` 可为不同 AI 编程工具生成对应项目级配置，当前支持 `cursor`、`claude-code`、`github-copilot`、`gemini-cli`、`openai-codex`、`antigravity`
- `--ai-tool-preset` 可快速展开工具组合，当前支持 `editor`、`terminal`、`all-major`
- `--third-party-skill` 可接入 skills.sh 生态中的第三方技能包，并生成安装指南
- `--third-party-skill-preset` 可展开预设技能集合，当前支持 `frontend`、`review`、`design`、`azure`
- `--install-third-party-skills` 只有显式开启时才会真正执行 `npx skills add ...`

## 配置文件示例

```json
{
  "projectName": "demo-app",
  "lang": "TypeScript",
  "framework": "Next.js",
  "db": "PostgreSQL",
  "orm": "Prisma",
  "style": "Tailwind CSS",
  "test": "Vitest",
  "frontend": true,
  "aiTools": ["cursor", "claude-code", "github-copilot"],
  "aiToolPresets": ["terminal"],
  "extra": [
    "代码提交前必须通过 lint（ESLint / golangci-lint）",
    "使用 Conventional Commits 规范提交信息"
  ],
  "mcp": ["filesystem", "git", "github", "browsertools"],
  "thirdPartySkills": ["vercel-labs/agent-skills", "anthropics/skills/frontend-design"],
  "thirdPartySkillPresets": ["frontend"]
}
```

## 已支持特性

- 可发布的 `bin` 入口
- `--yes`、`--force`、`--config`
- `--dry-run` 预览模式
- 多 AI 编程工具配置生成（Cursor / Claude Code / GitHub Copilot / Gemini CLI / OpenAI Codex / Antigravity）
- 第三方 `skills.sh` 技能集成清单生成
- 非交互参数覆盖
- 幂等化 README / `.gitignore` 管理
- Windows/macOS/Linux 路径兼容
- `node:test` 覆盖核心行为

## 协作与支持

- 贡献指南见 [CONTRIBUTING.md](CONTRIBUTING.md)
- 英文贡献指南见 [CONTRIBUTING.en.md](CONTRIBUTING.en.md)
- 行为约定见 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 安全问题提交流程见 [SECURITY.md](SECURITY.md)
- 英文安全说明见 [SECURITY.en.md](SECURITY.en.md)
- 一般使用支持见 [SUPPORT.md](SUPPORT.md)
- 英文支持说明见 [SUPPORT.en.md](SUPPORT.en.md)
- 版本变更记录见 [CHANGELOG.md](CHANGELOG.md)
- 英文总览见 [README.en.md](README.en.md)

## 发布检查清单

- 运行 `npm test`
- 运行 `npm pack --dry-run`
- 确认 `package.json` 中的 `name` / `version` / `description` / `keywords` 正确
- 如果准备公开发布，建议补齐 `repository`、`homepage`、`bugs`、`author`
- 确认 npm 账号已登录：`npm whoami`
- 正式发布：`npm publish`

## 对外公开前建议

- 补齐 `package.json` 中尚未确定的 `author`
- 配置 GitHub 仓库描述、topics、issue 模板与 PR 模板
- 首次发布后使用 tag 和 release notes 维护版本历史
- 如需进一步国际化，可继续补充英文版行为准则与变更日志
