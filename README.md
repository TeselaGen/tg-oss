# Teselagen's Open Source Mono Repo

# Packages

**@teselagen/ove** (open-source vector editor - a tool for viewing and manipulating DNA/AA sequences)

- DEMO: https://teselagen.github.io/tg-oss/ove
- CODE: https://github.com/TeselaGen/tg-oss/packages/ove

**@teselagen/ui** (reusable react components)

- DEMO: https://teselagen.github.io/tg-oss/ui
- CODE: https://github.com/TeselaGen/tg-oss/packages/ui

**@teselagen/bio-parsers** (parsers and formatters for genbank/fasta/json/snapgene/geneious/jbei-xml)

- CODE: https://github.com/TeselaGen/tg-oss/packages/bio-parsers

**@teselagen/sequence-utils** (util functions for working with biological sequences (dna/rna/protein))

- CODE: https://github.com/TeselaGen/tg-oss/packages/sequence-utils

**@teselagen/range-utils** (util functions for working with biological ranges e.g. {start: 2, end: 61})

- CODE: https://github.com/TeselaGen/tg-oss/packages/range-utils

**@teselagen/file-utils** (util functions for working with files and blobs)

- CODE: https://github.com/TeselaGen/tg-oss/packages/file-utils

# Repo Philosophy

This is a monorepo composed of multiple packages under /packages.
There are two types of packages, utils and ui (react) packages.
UI packages have everything util packages have but also have a demo and e2e cypress tests.
The config files for each package should extend the root config files.

# NX

We use NX to run tasks (https://nx.dev) and cache the task results.
NX allows us to only lint/build/test the packages that have changed since the last commit and caches the results of the tasks for efficient reruns.

## Getting Started (CONTRIBUTING)

Install Deps

```bash
yarn
```

Install vscode extension for nx

Run commands (build/start/test/lint etc..) from the nx extension in vscode or from the command line

Profit!

## How to Publish

using the vscode command prompt (cmd+shift+p):
Nx: run-many
publish
Execute: nx run-many --target=publish
