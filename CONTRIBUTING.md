# 贡献指南

感谢你为 ai-sop-setup 做出贡献。

[中文](CONTRIBUTING.md) | [English](CONTRIBUTING.en.md)

## 开始之前

- 使用 Node.js 18.18 或更高版本
- 先执行 `npm install`
- 提交前至少执行 `npm run test:ci`

## 建议工作流

1. 创建分支
2. 进行最小必要修改
3. 为行为变化补充或更新测试
4. 更新相关文档
5. 提交 PR

## 代码约定

- 保持 CommonJS 风格与现有目录结构一致
- 避免无关重构与大规模格式化
- 新增 CLI 参数时，同时更新帮助文本、README 与测试
- 新增生成文件时，同时考虑 dry-run、validate-config 与幂等行为

## 提交与 PR

建议使用清晰、可审查的提交粒度。

PR 请包含：

- 变更目的
- 主要实现点
- 测试结果
- 是否有破坏性变更

## 文档更新要求

以下场景通常需要同步更新文档：

- 新增命令或参数
- 调整生成文件结构
- 增加新的 AI 工具或预设
- 修改发布或安装方式

## 行为规范

参与协作即表示同意遵守 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。
