# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Teselagen's Open Source Mono Repo contains bioinformatics tools and components focused on DNA/RNA/protein sequence analysis and visualization. The repository uses Nx as a monorepo tool with multiple interconnected packages.

## Common Commands

### Development Setup
```bash
yarn                    # Install dependencies
```

### Package-Specific Commands (using Nx)
```bash
nx run <package-name>:<command>   # Run specific command for a package
nx run ove:start                  # Start OVE development server
nx run ui:start                   # Start UI components demo server
nx run ove:launch-e2e             # Launch Cypress e2e tests interactively
nx run ove:e2e                    # Run e2e tests headlessly
```

### Multi-Package Commands
```bash
nx run-many --target:build        # Build all packages
nx run-many --target:test         # Test all packages (uses Bun)
nx run-many --target:lint         # Lint all packages
nx affected -t test               # Test only affected packages
nx affected -t build              # Build only affected packages
```

### Testing
- Individual package: `nx run <package>:test`
- Uses Bun test runner by default
- E2e tests use Cypress with parallelization and recording

### Building
- Individual package: `nx run <package>:build`  
- UMD build (for OVE): `nx run ove:build_umd`
- Demo build: `nx run <package>:build --mode=demo`

### Publishing
```bash
nx run <package>:publish          # Publish latest version
nx run <package>:publish-beta     # Publish beta version
```

## Architecture

### Package Structure
The monorepo contains 6 main packages in `/packages/`:

1. **@teselagen/ove** - Open Vector Editor (DNA/protein sequence editor)
   - Main React-based sequence visualization and editing tool
   - Contains circular and linear views, alignment tools, enzyme management
   - Uses Redux for state management with custom middleware
   - Extensive Cypress e2e test suite

2. **@teselagen/ui** - Reusable React components
   - Blueprint.js-based UI component library
   - DataTable, form components, dialogs, file upload wizards
   - Demo site for component showcase

3. **@teselagen/bio-parsers** - File format parsers
   - Parsers for biological file formats: GenBank, FASTA, FASTQ, SBOL XML, Snapgene, etc.
   - Bi-directional conversion utilities (JSON ↔ various formats)

4. **@teselagen/sequence-utils** - Sequence manipulation utilities
   - Core algorithms for DNA/RNA/protein sequence operations
   - Restriction enzyme cutting, ORF finding, sequence translation
   - Melting temperature calculations, complement/reverse operations

5. **@teselagen/range-utils** - Range manipulation utilities
   - Utilities for working with biological ranges (start/end positions)
   - Handles circular and linear sequence coordinate systems
   - Range overlaps, translations, and normalization functions

6. **@teselagen/file-utils** - File handling utilities
   - File and blob manipulation utilities

### Key Dependencies and Tools
- **Nx**: Monorepo management and task running with caching
- **Vite**: Build tool for all packages  
- **Bun**: Test runner
- **Cypress**: E2e testing for UI packages
- **ESLint**: Code linting with TypeScript support
- **Blueprint.js**: UI component library foundation
- **React/Redux**: Core UI framework (for OVE and UI packages)

### Package Interdependencies
- OVE depends on: ui, bio-parsers, sequence-utils, range-utils
- bio-parsers depends on: sequence-utils, range-utils
- sequence-utils depends on: range-utils
- UI package is largely independent but used by OVE

### Configuration
- Root-level `nx.json` defines shared build/test/lint configurations
- Each package has a `project.json` for package-specific overrides
- TypeScript configs extend from root `tsconfig.base.json`
- Shared Vite configurations in package-specific `vite.config.ts` files

### Development Workflow
- Use `nx affected` commands to only process changed packages
- Nx caching optimizes repeated operations
- Each UI package (ove, ui) has demo sites for development
- E2e tests run against live development servers
- Git hooks manage linting and formatting (via Husky)

### Node Version
- Project uses Node 18.18.0 (specified in package.json volta config)
- Uses Yarn 1.22.21 as package manager