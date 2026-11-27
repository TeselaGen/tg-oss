#!/usr/bin/env bash
# Run inside the container: bash .devcontainer/check-isolation.sh
set -u
pass=0; fail=0
check() {
  if eval "$2" >/dev/null 2>&1; then echo "PASS  $1"; pass=$((pass+1))
  else echo "FAIL  $1"; fail=$((fail+1)); fi
}

check "running as non-root"                 '[ "$(id -u)" -ne 0 ]'
check "no SSH agent forwarded"              '[ -z "${SSH_AUTH_SOCK:-}" ]'
check "no host credentials in home"         '[ ! -e ~/.ssh ] && [ ! -e ~/.aws ] && [ ! -e ~/.config/doctl ] && [ ! -e ~/.gitconfig ]'
check "git has no credential helper"        '[ -z "$(git config --get-all credential.helper)" ]'
check "git credential fill returns nothing" '! (printf "protocol=https\nhost=github.com\n\n" | GIT_TERMINAL_PROMPT=0 timeout 5 git credential fill | grep -q "^password=")'
# check "example.com blocked"                 '! curl -sS -m 5 -o /dev/null https://example.com'
check "Claude API reachable"                'curl -sS -m 10 -o /dev/null https://api.anthropic.com'
check "npm registry reachable"              'curl -sS -m 10 -o /dev/null https://registry.npmjs.org'
check "Claude Code installed"               'claude --version'
check "node and yarn available"             'node --version && yarn --version'
check "bun available"                       'bun --version'
check "python available"                    'python3 --version'
check "Cypress binary installed"            'ls ~/.cache/Cypress/*/Cypress/Cypress'
check "bw not installed"                    '! command -v bw'
check ".git is read-only"                   '! touch /workspace/.git/write-test'

echo; echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
