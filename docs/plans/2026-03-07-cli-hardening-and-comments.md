# CLI Hardening and Comments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为当前 CLI 增加工程化注释、严格参数校验和 `--dry-run` 能力，提升可维护性、可预测性和发布质量。

**Architecture:** 保持当前 `bin + src` 结构不变，在 `cli/config/index/fs-utils` 四层分别补齐职责：参数层负责识别新 flag，配置层负责严格校验，执行层负责 dry-run 规划与输出，工具层负责 managed block 写入/预览。注释采用 JSDoc 风格，覆盖模块导出函数和关键流程节点。

**Tech Stack:** Node.js CommonJS、原生 `node:test`

---

### Task 1: 为核心模块补充注释

**Files:**
- Modify: `src/cli.js`
- Modify: `src/config.js`
- Modify: `src/fs-utils.js`
- Modify: `src/index.js`

**Step 1: Write the failing test**

```javascript
// 该任务以代码审阅为主，可不新增行为测试，改为 lint-style review checklist。
```

**Step 2: Run check to verify current gap**

Run: `grep -n "function " src/*.js`
Expected: 多数函数没有注释说明

**Step 3: Write minimal implementation**

```javascript
/**
 * Parse raw argv tokens into structured flags and values.
 */
function parseArgv(argv) {}
```

**Step 4: Run tests to ensure no regression**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/cli.js src/config.js src/fs-utils.js src/index.js
git commit -m "docs: add maintainability comments to cli internals"
```

### Task 2: 增加严格参数校验

**Files:**
- Modify: `src/config.js`
- Modify: `src/index.js`
- Modify: `README.md`
- Test: `tests/cli/config-resolution.test.js`

**Step 1: Write the failing test**

```javascript
test('invalid framework value throws clear error', async () => {
  await assert.rejects(() => resolveRuntimeOptions(...), /framework/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL because invalid value currently falls back silently

**Step 3: Write minimal implementation**

```javascript
if (!matched) {
  throw new Error(`无效的 framework: ${value}`);
}
```

**Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/config.js src/index.js README.md tests/cli/config-resolution.test.js
git commit -m "feat: validate cli option values strictly"
```

### Task 3: 增加 dry-run 执行预览

**Files:**
- Modify: `src/cli.js`
- Modify: `src/constants.js`
- Modify: `src/index.js`
- Modify: `src/fs-utils.js`
- Test: `tests/cli/integration-smoke.test.js`

**Step 1: Write the failing test**

```javascript
test('dry-run does not create files', async () => {
  const code = await runCli({ argv: ['--yes', '--dry-run', ...] });
  assert.equal(code, 0);
  assert.equal(fs.existsSync(targetFile), false);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL because files are still written

**Step 3: Write minimal implementation**

```javascript
if (flags.dryRun) {
  stdout.write('DRY RUN\n');
  return 0;
}
```

**Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/cli.js src/constants.js src/index.js src/fs-utils.js tests/cli/integration-smoke.test.js
git commit -m "feat: add dry-run preview mode"
```

### Task 4: 完善帮助与使用文档

**Files:**
- Modify: `README.md`
- Modify: `src/constants.js`

**Step 1: Write the failing test**

```javascript
test('help text includes dry-run', () => {
  assert.match(buildHelpText(), /dry-run/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL because help text lacks dry-run

**Step 3: Write minimal implementation**

```javascript
"      --dry-run             仅预览将写入的文件，不真正落盘"
```

**Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md src/constants.js tests/cli/parse-argv.test.js
git commit -m "docs: document dry-run and validation behavior"
```
