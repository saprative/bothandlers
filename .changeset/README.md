# Changesets

This directory contains configuration for [Changesets](https://github.com/changesets/changesets).

When you make a change that requires a new version of the SDK, run `pnpm changeset` at the root of the repo.
Commit the generated markdown file. A GitHub Action will handle bumping the version and publishing.
