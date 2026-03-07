# Python 编码规范 Rules

## 代码风格
- 遵循 PEP 8，用 black 格式化，isort 整理 imports
- 类型注解：所有函数参数和返回值必须有类型注解
- 文档字符串：公开函数必须有 docstring（Google 风格）

## 错误处理
- 禁止裸 except:，必须捕获具体异常类型
- 自定义异常继承自 Exception，放在 exceptions.py 中统一管理
- 日志使用 logging 模块，不用 print

## 项目结构
- 依赖管理用 pyproject.toml（poetry 或 uv），不用 requirements.txt
- 配置用 pydantic Settings，不直接读 os.environ
- 数据库操作通过 Repository 层，不在路由函数中直接写 ORM 查询
