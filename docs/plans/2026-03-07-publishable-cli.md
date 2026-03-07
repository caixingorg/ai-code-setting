# Publishable CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前单文件交互脚本升级为可发布、可复用、可非交互执行的 CLI 工具，支持 `--yes`、`--force`、`--config` 和更多参数覆盖。

**Architecture:** 保留现有模板生成能力，但拆分为 `bin + src` 结构：`bin` 负责 CLI 入口和错误退出码，`src` 负责参数解析、配置归一化、交互采集、文件写入和模板生成。通过统一常量与路径清单减少硬编码，并在文件系统与路径处理上增强 Windows 兼容性。

**Tech Stack:** Node.js（CommonJS）、原生 `fs/path/os/readline`、`node:test`

---

### Task 1: 盘点现状并建立工程骨架

**Files:**
- Create: `package.json`
- Create: `bin/ai-sop-setup.js`
- Modify: `ai-sop-setup.js`
- Create: `src/index.js`
- Create: `src/cli.js`
- Create: `src/constants.js`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgv } from '../src/cli.js';

test('parses yes force and config flags', () => {
  const result = parseArgv(['--yes', '--force', '--config', 'config.json']);
  assert.equal(result.flags.yes, true);
  assert.equal(result.flags.force, true);
  assert.equal(result.flags.config, 'config.json');
});
```

**Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL with module or function missing

**Step 3: Write minimal implementation**

```javascript
function parseArgv(argv) {
  return { flags: { yes: argv.includes('--yes'), force: argv.includes('--force'), config: 'config.json' } };
}
```

**Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json bin/ai-sop-setup.js ai-sop-setup.js src/index.js src/cli.js src/constants.js tests/cli/parse-argv.test.js
git commit -m "feat: scaffold publishable cli"
```

### Task 2: 抽离模板与生成清单

**Files:**
- Create: `src/templates.js`
- Create: `src/manifest.js`
- Modify: `src/index.js`
- Modify: `src/constants.js`

**Step 1: Write the failing test**

```javascript
test('buildGeneratedFiles returns required output entries', () => {
  const files = buildGeneratedFiles(sampleConfig);
  assert(files.some((entry) => entry.path === '.cursor/rules/project.mdc'));
  assert(files.some((entry) => entry.path === '.cursor/mcp.json.example'));
});
```

**Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL with build function missing

**Step 3: Write minimal implementation**

```javascript
function buildGeneratedFiles(config) {
  return [{ path: '.cursor/rules/project.mdc', content: genProjectRules(config) }];
}
```

**Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/templates.js src/manifest.js src/index.js src/constants.js tests/core/build-generated-files.test.js
git commit -m "refactor: extract templates and generation manifest"
```

### Task 3: 实现配置合并与非交互执行

**Files:**
- Create: `src/config.js`
- Modify: `src/cli.js`
- Modify: `src/index.js`
- Create: `tests/cli/config-resolution.test.js`

**Step 1: Write the failing test**

```javascript
test('config file and argv merge into final config', async () => {
  const result = await resolveRuntimeOptions({
    cwd: '/tmp/demo',
    argv: ['--config', 'fixture.json', '--project-name', 'demo', '--yes']
  });
  assert.equal(result.answers.projectName, 'demo');
  assert.equal(result.flags.yes, true);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL with resolver missing

**Step 3: Write minimal implementation**

```javascript
async function resolveRuntimeOptions(input) {
  return { flags: { yes: true }, answers: { projectName: 'demo' } };
}
```

**Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/config.js src/cli.js src/index.js tests/cli/config-resolution.test.js
 git commit -m "feat: support config file and non-interactive flags"
```

### Task 4: 增强写入策略与 Windows 兼容性

**Files:**
- Create: `src/fs-utils.js`
- Modify: `src/index.js`
- Modify: `src/constants.js`
- Create: `tests/core/file-planning.test.js`

**Step 1: Write the failing test**

```javascript
test('force flag controls overwrite planning', () => {
  const plan = planWriteOperations({ existingPaths: ['README.md'], force: false });
  assert.equal(plan.requiresConfirmation, true);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL with planning helper missing

**Step 3: Write minimal implementation**

```javascript
function planWriteOperations(input) {
  return { requiresConfirmation: input.existingPaths.length > 0 && !input.force };
}
```

**Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/fs-utils.js src/index.js src/constants.js tests/core/file-planning.test.js
 git commit -m "refactor: improve overwrite planning and path handling"
```

### Task 5: 发布准备与文档完善

**Files:**
- Modify: `README.md`
- Modify: `package.json`
- Create: `tests/cli/integration-smoke.test.js`
- Modify: `bin/ai-sop-setup.js`

**Step 1: Write the failing test**

```javascript
test('cli prints help and exits 0', async () => {
  const { code, stdout } = await runCli(['--help']);
  assert.equal(code, 0);
  assert.match(stdout, /--yes/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL with help output missing

**Step 3: Write minimal implementation**

```javascript
if (flags.help) {
  console.log(helpText);
  return 0;
}
```

**Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md package.json bin/ai-sop-setup.js tests/cli/integration-smoke.test.js
 git commit -m "docs: prepare cli for publishing"
```
