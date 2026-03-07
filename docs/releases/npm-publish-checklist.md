# npm Publish Checklist

## Before Publishing

- Confirm the current branch is `main`
- Confirm the working tree is clean with `git status --short --branch`
- Confirm the latest tag is `v1.0.0`
- Confirm `package.json` metadata is correct
- Confirm npm login with `npm whoami`

## Validation

- Run `npm run test:ci`
- Run `npm pack --dry-run`
- Optionally install the packed tarball locally for a final smoke test

## Publish

- Run `npm publish`

## After Publishing

- Verify the package page on npm
- Create or publish the GitHub Release using the prepared release notes
- Add repository badges if needed
- Announce the release to target users or team members
