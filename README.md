# Teselagen's Open Source Mono Repo

# Packages

**@teselagen/ove** (open-source vector editor - a tool for viewing and manipulating DNA/AA sequences)

- DEMO: https://teselagen.github.io/tg-oss/ove
- CODE: [packages/ove](./packages/ove)

**@teselagen/ui** (reusable react components)

- DEMO: https://teselagen.github.io/tg-oss/ui
- CODE: [packages/ui](./packages/ui)

**@teselagen/bio-parsers** (parsers and formatters for genbank/fasta/json/snapgene/geneious/jbei-xml)

- CODE: [packages/bio-parsers](./packages/bio-parsers)

**@teselagen/sequence-utils** (util functions for working with biological sequences (dna/rna/protein))

- CODE: [packages/sequence-utils](./packages/sequence-utils)

**@teselagen/range-utils** (util functions for working with biological ranges e.g. {start: 2, end: 61})

- CODE: [packages/range-utils](./packages/range-utils)

**@teselagen/file-utils** (util functions for working with files and blobs)

- CODE: [packages/file-utils](./packages/file-utils)

# Contributing

This project welcomes contributions. Please have a look at the [CONTRIBUTING](./CONTRIBUTING.md) file to learn about how to get started after a fresh clone.

# License

All code from this repository is placed under the [MIT License](./LICENSE).

## Publishing (works the same for all packages)

```
nx run ui:publish
nx run ove:publish
nx run-many --target=publish --projects=bio-parsers,ove,sequence-utils,ui
```

## Publishing a beta version (for use when linking to a branch in another project)

```
nx run ui:publish-beta
nx run ove:publish-beta
nx run-many --target=publish-beta --projects=bio-parsers,ove,sequence-utils,ui
```

# Running tests

Unit tests are run automatically via precommit hook that runs a `bun test` command at the top level

Cypress e2e tests can be run locally via the following commands:
`nx run ove:launch-e2e`
`nx run ui:launch-e2e`

CI is run via GitHub Actions on every push and pull request and runs a suite of Cypress e2e tests

# Linting

yarn lint

linting happens via oxlint
