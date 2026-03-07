# Contributing Guide

Thanks for contributing to ai-sop-setup.

[中文](CONTRIBUTING.md) | [English](CONTRIBUTING.en.md)

## Before You Start

- Use Node.js 18.18 or later
- Run `npm install`
- Run at least `npm run test:ci` before submitting changes

## Recommended Workflow

1. Create a branch
2. Make the smallest necessary change
3. Add or update tests for behavior changes
4. Update related documentation
5. Open a pull request

## Code Conventions

- Keep the existing CommonJS style and current directory structure
- Avoid unrelated refactors or large formatting-only changes
- When adding CLI options, update help text, README, and tests together
- When adding generated files, also consider dry-run, validate-config, and idempotent behavior

## Commits and Pull Requests

Prefer small, reviewable commits.

A pull request should include:

- The purpose of the change
- The main implementation points
- Test results
- Whether the change is breaking

## Documentation Expectations

You will usually need documentation updates when you:

- Add commands or options
- Change generated file structure
- Add new AI tools or presets
- Change installation or publishing flow

## Conduct

By participating, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
