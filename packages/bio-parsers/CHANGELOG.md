# Changelog

## 1.0.0 (2026-11-27)

- BREAKING: package renamed from `@teselagen/bio-parsers` to `@opencloning/tg-oss-bio-parsers`. This is a fork of [TeselaGen/tg-oss](https://github.com/TeselaGen/tg-oss), which is no longer maintained by its original authors. Update your dependencies and imports, or keep existing imports with an npm alias: `"@teselagen/bio-parsers": "npm:@opencloning/tg-oss-bio-parsers@^1.0.0"`
- depends on `@opencloning/tg-oss-sequence-utils`, `@opencloning/tg-oss-range-utils` instead of the `@teselagen` versions
- fix: in multi-record GenBank files, derive the molecule type (DNA/RNA/protein, single/double stranded) per record. Previously each record inherited the flags of the records before it, and the caller's `options` object was mutated (#282)
- fix(deps): update `fast-xml-parser` to ^5.12.1 and `fflate` to ^0.8.3 (security advisories)

## 0.4.38 (2026-04-22)

- refactor: extract and export featureToLocationString for use in other places

## 0.4.37 (2026-04-16)

- fix: better color parsing for snapgene files

## 0.4.36 (2026-02-25)

- fix: format long note as multiple lines in Genbank string

## 0.4.35 (2026-02-04)

- fix: get feature name from /region_name or /product

## 0.4.34 (2026-01-30)

- fix: support '=' in LOCUS, COMMENT, etc

## 0.4.33 (2025-01-05)

- Initialize changelog
