# Changelog

## 1.0.0 (2026-11-27)

- BREAKING: package renamed from `@teselagen/ui` to `@opencloning/tg-oss-ui`. This is a fork of [TeselaGen/tg-oss](https://github.com/TeselaGen/tg-oss), which is no longer maintained by its original authors. Update your dependencies and imports, or keep existing imports with an npm alias: `"@teselagen/ui": "npm:@opencloning/tg-oss-ui@^1.0.0"`
- depends on `@opencloning/tg-oss-file-utils` instead of the `@teselagen` versions
- fix(deps): update `nanoid` to ^5.1.16 (security advisory)

## 0.10.24 (2026-05-22)

- feat: DataTable copy now also writes `text/html` to the clipboard, so pasting into rich-text editors (ELN, Google Docs, Notion) keeps the table structure

## 0.10.23 (2026-05-05)

- fix: add data-test-value to select to help w testing
- fix: remove Loading component completely from table when loading is false

## 0.10.22 (2026-04-29)

- feat: added tag input class name support to TgSelectMulti

## 0.10.21 (2026-04-27)

- fix: add option to disable upload example links for tests

## 0.10.20 (2026-01-23)

- fix protein 'size' filter and support '\_in', '\_nin' and '\_regex' filter

## 0.10.19 (2026-01-27)

- fix: avoid autoTooltip.js offend non OVE related dom element

## 0.10.18 (2026-01-05)

- fix cutsites and performance issue for multiple Editor

## 0.10.17 (2026-01-05)

- republish to fix build_umd

## 0.10.16 (2025-01-05)

- Initialize changelog
