# Prisma 使用规范 Rules

## Schema
- 每张表必须有 id（cuid 或 uuid）和 createdAt、updatedAt 字段
- 关系字段必须明确定义 onDelete 行为
- 枚举值用全大写 SNAKE_CASE
- 每次 Schema 变更都要运行 prisma migrate dev，禁止直接改数据库

## 查询规范
- 禁止 findMany 不加 take（默认限制，防止全表扫描）
- 关联查询用 include 而不是多次单独查询（N+1 问题）
- 写操作统一通过 Service 层，禁止在路由/控制器层直接写 prisma 查询
- 批量写操作用 createMany/updateMany，不用循环单条写入

## 错误处理
- 捕获 PrismaClientKnownRequestError，对常见错误码（P2002 唯一约束等）返回友好提示
- 数据库连接错误不暴露给客户端，统一返回 500 和通用错误信息
