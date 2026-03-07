# React 组件规范 Rules

## 组件写法
- 必须使用函数式组件 + Hooks，禁止类组件
- Props 必须定义独立的 interface，命名为 XxxProps
- 组件内代码顺序：imports → types/interfaces → component → export default
- 不在组件内写匿名箭头函数作为事件处理（性能问题），抽取为具名函数

## 状态与副作用
- 副作用统一放在自定义 Hook 中，不直接写在组件体里
- 派生状态不用 useState，直接计算
- useEffect 的依赖数组必须完整，不允许用注释屏蔽 lint 警告

## 性能
- 大列表使用虚拟滚动（react-virtual 或同类库）
- 列表渲染的 key 必须稳定唯一（禁止用 index）
- 避免在渲染过程中创建新对象/数组（memo/useMemo 合理使用）

## 条件渲染
- 条件渲染超过 2 层嵌套时，抽取为独立子组件或使用早返回模式
- 禁止用 && 渲染数字（如 count && <Badge>），用三元或 !! 转布尔值

## 样式
- 不在组件内写内联 style（除动态计算的值）
- 组件私有样式用 CSS Modules 或 Tailwind，不用全局 class
