<!-- TOC -->

- [[CHANGELOG](Changelog.md)](#changelogchangelogmd)
- [Installing](#installing)
- [Usage](#usage)
- [About this Repo](#about-this-repo)
- [Editing This Repo:](#editing-this-repo)
  - [All collaborators:](#all-collaborators)
- [Updating this repo:](#updating-this-repo)
  - [Teselagen collaborators:](#teselagen-collaborators)
  - [Outside collaborators:](#outside-collaborators)
- [Building](#building)
- [Running unit tests](#running-unit-tests)

<!-- /TOC -->

## [CHANGELOG](Changelog.md)

## Installing

```
npm install @teselagen-biotech/range-utils
```

## Usage

```
import { getRangeLength } from '@teselagen-biotech/range-utils';
```

## About this Repo

This is a collection of range utility functions.

A range must be an object with a start and end property.
Eg:

```
const myRange = {
	start: 10,
	end: 40
}
```

A "circular" range has a start > end.
Eg:

```
const myRange2 = {
	start: 50,
	end: 40
}
```

All ranges are assumed to have 0-based inclusive indices:

rrrr
0123
start = 0,
end = 3

## Editing This Repo:

### All collaborators:

Edit/create a new file and update/add any relevant tests.
You can run `npm test` to make sure all tests pass.
Tests will automatically be run pre-commit.

## Updating this repo:

### Teselagen collaborators:

Commit and push all changes
Sign into npm using the teselagen npm account (npm whoami)

```
npm version patch|minor|major
npm publish
```

### Outside collaborators:

fork and pull request please :)

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build range-utils` to build the library.

## Running unit tests

Run `nx test range-utils` to execute the unit tests via [Jest](https://jestjs.io).
