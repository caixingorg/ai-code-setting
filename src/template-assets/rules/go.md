# Go 编码规范 Rules

## 代码风格
- 遵循 Effective Go 和 Go Code Review Comments
- 错误处理：所有错误必须被处理或明确忽略（_ = err 需注释说明原因）
- 包命名：小写，单词，无下划线（userservice 而非 user_service）

## 错误处理
- 错误向上传播时用 fmt.Errorf("operation: %w", err) 包装
- 自定义错误类型实现 error interface
- 禁止 panic（除初始化阶段），业务层统一返回 error

## 并发
- goroutine 必须有退出机制，禁止泄露
- 共享状态用 sync.Mutex 或 channel，明确注释并发安全性
- 用 context 传递取消信号和超时，不用全局变量
