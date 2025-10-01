# TeselaGen Open Source Monorepo Guidance

## Project Overview

TeselaGen's monorepo contains multiple open-source packages focused on biological sequence visualization, manipulation, and analysis:

- **@teselagen/ove**: Open Vector Editor - DNA/AA sequence viewer and editor
- **@teselagen/ui**: Reusable React UI components library
- **@teselagen/bio-parsers**: Parsers for biological file formats (GenBank, FASTA, etc.)
- **@teselagen/sequence-utils**: Utilities for manipulating biological sequences
- **@teselagen/range-utils**: Utilities for working with biological sequence ranges
- **@teselagen/file-utils**: General file manipulation utilities

## Architecture

### Monorepo Structure

- Uses NX for monorepo management
- Packages in `/packages/{package-name}`
- Each UI package has:

  - Demo implementations
  - Cypress e2e tests
  - Config files that extend root configs

### Key Packages

#### @teselagen/ove (Open Vector Editor)

- React/Redux-based DNA sequence editor
- Key components:
  - `Editor`: Main editor component (Redux-connected)
  - `SimpleCircularOrLinearView`: Simplified viewer (non-Redux)
  - `EnzymeViewer`: Enzyme visualization
- UMD build available for non-React environments
- Supports DNA and Protein sequence visualization

#### @teselagen/ui

- Blueprint-based UI component library
- Contains reusable components like:
  - DialogFooter
  - DataTable
  - FormComponents
  - TgSelect/TgSuggest

## Development Workflows

### Local Setup

```bash
yarn
```

### Running Tasks

Use NX to run tasks:

```bash
# Start demos
nx run ui:start
nx run ove:start

# Run E2E tests
nx run ove:launch-e2e

# Build packages
nx run-many --target=build
```

### Testing

- **Unit tests**: Run with `bun test` from root
- **E2E tests**: Run with `nx run [package]:launch-e2e`
- **CI**: Runs on GitHub Actions on push/PR

### Publishing

```bash
# Publish a single package
nx run ui:publish
nx run ove:publish

# Publish multiple packages
nx run-many --target=publish --projects=bio-parsers,ove,sequence-utils,ui

# Publish beta versions
nx run ui:publish-beta
```

## Key Concepts

### OVE Data Model

- The core sequenceData object follows Teselagen JSON format:

```js
{
  sequence: "atagatagagaggcccg",
  features: [{
    type: "misc_feature",
    start: 0, // 0-based inclusive
    end: 10,
    id: 'uniqueID',
    forward: true // strand direction
  }],
  parts: [],
  // For protein sequences:
  isProtein: true,
  proteinSequence: "MXYZ..." // Optional if sequence provided
}
```

### Feature Locations

Features can have multiple internal locations:

```js
{
  name: "GFP_with_locations",
  start: 10,
  end: 40,
  locations: [
    { start: 10, end: 15 },
    { start: 18, end: 19 },
    { start: 35, end: 40 }
  ]
}
```

### Alignment Tracks

Alignments follow this model:

```js
{
  sequenceData: {
    id: "2",
    name: "GFPuv58",
    sequence: "GTTCAAT..."
  },
  alignmentData: {
    id: "2",
    sequence: "GTTCAA--TGCT..." // Same sequence with gaps
  }
}
```

## Common Tasks

### Debugging Redux State

- Install Redux DevTools in your browser
- Access `currentEditorState` via `editor.getState()`

### Extending UI Components

- Look at existing components in packages/ui/src for patterns
- Components use Blueprint as UI foundation

### Creating Custom Tools

- See existing tool implementations in packages/ove/src/ToolBar

### Implementing Autosave

- Pass `shouldAutosave: true` to Editor props
- Return a Promise from onSave handler for proper UI feedback
