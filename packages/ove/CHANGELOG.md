# Changelog

## 1.0.0 (2026-11-27)

- BREAKING: package renamed from `@teselagen/ove` to `@opencloning/tg-oss-ove`. This is a fork of [TeselaGen/tg-oss](https://github.com/TeselaGen/tg-oss), which is no longer maintained by its original authors. Update your dependencies and imports, or keep existing imports with an npm alias: `"@teselagen/ove": "npm:@opencloning/tg-oss-ove@^1.0.0"`
- depends on `@opencloning/tg-oss-bio-parsers`, `@opencloning/tg-oss-file-utils`, `@opencloning/tg-oss-range-utils`, `@opencloning/tg-oss-sequence-utils`, `@opencloning/tg-oss-ui` instead of the `@teselagen` versions
- change: replace the unmaintained `shortid` with `nanoid`, so generated ids are now 21 characters long (previously ~7-14) using the same URL-safe alphabet
- fix(deps): update `lodash` to ^4.18.1 (security advisory)

## 0.8.42 (2026-04-16)

- fix: better color parsing for snapgene files

## 0.8.41 (2026-03-27)

- fix: improve filter and navigation functionality in alignment view

## 0.8.40 (2026-03-27)

- feat: Add mismatch visualization to alignment view and support mismatch filtering in search

## 0.8.39 (2026-03-23)

- feat: Pass sequence length to `pareDownAnnotations` for accurate range calculation

## 0.8.38 (2026-02-25)

- fix: format long note as multiple lines in Genbank string

## 0.8.37 (2026-01-23)

- fix: fix protein 'size' filter and support '\_in', '\_nin' and '\_regex' filter

## 0.8.36 (2026-01-28)

- fix: use right font size when calculating the annotation text position
- clean up unused deps

## 0.8.35 (2026-02-04)

- fix: get feature name from /region_name or /product

## 0.8.34 (2026-02-01)

- fix: improve mismatch visibility in alignment view

## 0.8.33 (2026-01-31)

- fix: remove leaking CSS on H5 elements introduced in #198 (fix #257)

## 0.8.32 (2026-01-30)

- fix: support '=' in LOCUS, COMMENT, etc

## 0.8.31 (2026-01-27)

- fix: avoid autoTooltip.js offend non OVE related dom element

## 0.8.30 (2026-01-16)

- fix cutsites and performance issue for multiple Editor

## 0.8.29 (2026-01-08)

- fix: show right caret position when clicking the rightest position of linear view
- support custom function for insert string filtering
- fix annotation lable for non-english characters

## 0.8.28 (2026-01-07)

- fix: improve AASliver text appearance by correcting svg transform

## 0.8.27 (2026-06-10)

- fix: scroll hover jank resulting from withHover redux actions by making hoveredAnnotation track purely thru easyState

## 0.8.26 (2026-01-05)

- republish to fix build_umd

## 0.8.25 (2025-01-05)

- Initialize changelog
