## 🤖 AI 辅助开发配置

本项目已配置 AI 编程 SOP，当前已生成的 AI 工具配置：{{toolNames}}

### 快速开始

{{toolSetupSteps}}

### 主要配置文件

{{primaryInstructionFiles}}

### Skills 速查

| 场景 | 模板文件 |
|------|---------|
| 新增功能模块 | `docs/ai-skills/feature/new-feature.md` |
| 需求转技术方案 | `docs/ai-skills/feature/prd-to-design.md` |
| Bug 分析修复 | `docs/ai-skills/debug/analyze-bug.md` |
| 代码 Review | `docs/ai-skills/review/code-review.md` |
| 安全检查 | `docs/ai-skills/review/security-check.md` |
| 代码重构 | `docs/ai-skills/refactor/refactor.md` |
| 生成测试 | `docs/ai-skills/test/gen-tests.md` |

### 安全规范

- ⚠️ 禁止将 `.env`、数据库密码、API Key 粘贴给 AI
- ⚠️ Agent 执行前请确保 Git 工作区干净（已提交）
- ⚠️ 所有 AI 生成代码必须人工 Review 后再提交

> 由 ai-sop-setup 为 {{projectName}} 自动生成。
