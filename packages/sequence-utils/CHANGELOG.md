# Changelog

## 1.0.0 (2026-11-27)

- BREAKING: package renamed from `@teselagen/sequence-utils` to `@opencloning/tg-oss-sequence-utils`. This is a fork of [TeselaGen/tg-oss](https://github.com/TeselaGen/tg-oss), which is no longer maintained by its original authors. Update your dependencies and imports, or keep existing imports with an npm alias: `"@teselagen/sequence-utils": "npm:@opencloning/tg-oss-sequence-utils@^1.0.0"`
- depends on `@opencloning/tg-oss-range-utils` instead of the `@teselagen` versions
- change: replace the unmaintained `shortid` with `nanoid`, so generated ids are now 21 characters long (previously ~7-14) using the same URL-safe alphabet
- fix(deps): update `jsondiffpatch` to ^0.7.7 (security advisory)

## 0.3.42 (2026-01-08)

- support custom function for insert string filtering

## 0.3.41 (2025-01-05)

- Initialize changelog
