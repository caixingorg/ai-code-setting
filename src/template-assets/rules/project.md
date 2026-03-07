# {{projectName}} — 项目技术规范 Rules
# 此文件由 ai-sop-setup 自动生成，请按项目实际情况维护
# 每次 AI 在本项目工作时，都会优先读取此文件

## 技术栈
- 语言：{{lang}}
- 框架：{{framework}}
{{dbLine}}
{{cacheLine}}
{{styleLine}}
- 测试框架：{{test}}
{{extraLines}}

## 代码规范
- 变量/函数命名：camelCase，函数以动词开头（getUserById, createOrder）
- 类/组件命名：PascalCase
- 常量命名：UPPER_SNAKE_CASE
- 文件命名：kebab-case（组件除外，组件用 PascalCase）
- 禁止使用 {{typeRule}}
- 所有异步操作必须有错误处理（try/catch 或 .catch()）
- 禁止 console.log 进入生产代码，使用项目统一的 logger

## 架构约定
- 目录结构严格按照项目 README 中的说明组织
- 禁止在 UI 组件中直接调用数据库或发起 HTTP 请求
- 业务逻辑集中在 services/ 层，保持 controller/route 层薄
- 工具函数放在 utils/ 或 lib/ 下，禁止在业务代码中写重复工具逻辑
- 公共类型定义放在 types/ 下，禁止在单个文件内定义跨文件使用的类型

## 响应格式（API 项目）
- 所有接口统一返回格式：{ data, error, code, message }
- 成功 code=200，参数错误 code=400，未授权 code=401，服务错误 code=500
- 分页参数统一：page（从 1 开始），pageSize（默认 20，上限 100）
- 错误信息不暴露内部堆栈信息给客户端

## Agent 执行安全边界（严格遵守）
- 禁止读取或修改 .env 文件及任何包含密钥的文件
- 禁止删除 migration 文件或 schema 文件
- 禁止修改 package.json 中已锁定的核心依赖版本
- 修改超过 5 个文件前，必须先输出完整的修改计划等待确认
- 禁止在未经确认的情况下运行 DROP、DELETE 等破坏性数据库操作
