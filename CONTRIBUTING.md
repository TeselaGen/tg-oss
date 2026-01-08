# Contributing to the code

## Repo Philosophy

This is a monorepo composed of multiple packages under `/packages`.
There are two types of packages: utils and ui (react) packages.
UI packages have everything util packages have but also have a demo and e2e cypress tests.
The config files for each package should extend the root config files.

## Getting started

Fork the repo, clone your fork locally and get into the project's root directory.

Install dependencies with `yarn`:

```bash
yarn
```

## Running tasks

We use [NX](https://nx.dev) to run tasks and cache the results.
NX allows us to only lint/build/test the packages that have changed since the last commit and caches the results of the tasks for efficient reruns.

### Command line

```bash
nx run <package-name>:<command>
```

```bash
nx run ui:start
nx run ove:start
nx run ove:launch-e2e
nx run ove:build
```

```bash
nx run --target:<command>
```

```bash
nx run-many --target:build
nx run-many --target:build
```

### Editor integration

Integrations of `NX` exist for VCCode, JetBrains and Neovim editors, you can install them to run nx commands from your editor directly:

https://nx.dev/core-features/integrate-with-editors

## How to Publish

See the [README](./README.md)
