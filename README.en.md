# ai-sop-setup

Upgrade a one-off AI SOP bootstrap script into a publishable, reusable Node.js CLI.

[中文](README.md) | [English](README.en.md)

- Repository: [caixingorg/ai-code-setting](https://github.com/caixingorg/ai-code-setting)
- Issue tracker: [Issues](https://github.com/caixingorg/ai-code-setting/issues)

## Project Status

- Suitable for an early public release
- Covers core CLI flows, non-interactive usage, dry-run mode, and multi-tool AI config generation
- Recommended to keep refining release notes, badges, and maintainer metadata before broader promotion

## Installation

### Local development

- `npm install`
- `npm run test:ci`

### Global install

- `npm install -g ai-sop-setup`
- `ai-sop-setup --help`

## Quick Start

1. Run the CLI in your target project directory
2. Execute `ai-sop-setup --yes --ai-tool-preset all-major`
3. Review generated AI instruction files, the managed README block, and MCP example config
4. Use `ai-sop-setup --yes --dry-run` first if you only want a preview

### Common output files

- `.cursor/rules/*.mdc`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `GEMINI.md`
- `AGENTS.md`
- `.ai-sop/mcp.json.example`

## Usage

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

## Behavior Notes

- Invalid values for `--lang`, `--framework`, `--db`, `--orm`, `--style`, and `--test` fail fast instead of silently falling back
- `--dry-run` previews file changes without writing to disk
- `validate-config` only validates and prints normalized config; it does not prompt or write files
- `--config` supports `.json`, `.jsonc`, `.js`, and `.cjs`
- `--ai-tool` generates project-level instructions for supported tools: `cursor`, `claude-code`, `github-copilot`, `gemini-cli`, `openai-codex`, `antigravity`
- `--ai-tool-preset` expands tool groups: `editor`, `terminal`, `all-major`
- `--third-party-skill` integrates third-party packages from the skills.sh ecosystem and generates installation guidance
- `--third-party-skill-preset` expands skill bundles: `frontend`, `review`, `design`, `azure`
- `--install-third-party-skills` only runs `npx skills add ...` when explicitly enabled

## Example Config

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
    "Lint must pass before commit (ESLint / golangci-lint)",
    "Use Conventional Commits for commit messages"
  ],
  "mcp": ["filesystem", "git", "github", "browsertools"],
  "thirdPartySkills": ["vercel-labs/agent-skills", "anthropics/skills/frontend-design"],
  "thirdPartySkillPresets": ["frontend"]
}
```

## Included Features

- Publishable `bin` entry
- `--yes`, `--force`, `--config`
- `--dry-run` preview mode
- Multi-tool AI config generation for Cursor, Claude Code, GitHub Copilot, Gemini CLI, OpenAI Codex, and Antigravity
- Third-party `skills.sh` integration planning
- Non-interactive parameter overrides
- Idempotent README and `.gitignore` management
- Windows/macOS/Linux path compatibility
- Core behavior covered by `node:test`

## Collaboration and Support

- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- English contribution guide: [CONTRIBUTING.en.md](CONTRIBUTING.en.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security policy: [SECURITY.md](SECURITY.md)
- English security policy: [SECURITY.en.md](SECURITY.en.md)
- Support guide: [SUPPORT.md](SUPPORT.md)
- English support guide: [SUPPORT.en.md](SUPPORT.en.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

## Release Checklist

- Run `npm run test:ci`
- Run `npm pack --dry-run`
- Verify `name`, `version`, `description`, and `keywords` in `package.json`
- Verify npm auth with `npm whoami`
- Publish with `npm publish`

## Remaining Public-Project Improvements

- Fill the final maintainer-specific `author` field in `package.json`
- Add repository badges, release notes, and GitHub topics
- Extend bilingual support to the code of conduct and changelog if needed
