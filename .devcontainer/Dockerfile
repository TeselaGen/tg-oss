# Tool binary sources (COPY --from cannot use build args directly, so they go through named stages)
ARG UV_VERSION=0.13.7
ARG BUN_VERSION=1
FROM ghcr.io/astral-sh/uv:${UV_VERSION} AS uv
FROM oven/bun:${BUN_VERSION} AS bun

# The publish workflow builds with node 24, and the repo installs and builds fine on it
FROM node:24-trixie-slim

ARG TZ=Europe/London
ENV TZ="$TZ"
# The node image already has a non-root user "node" with UID 1000; reuse it
# (Claude Code refuses --dangerously-skip-permissions as root)
ARG USERNAME=node
ARG CLAUDE_CODE_VERSION=stable
# Not needed by the project, but handy for scripts and tooling
ARG PYTHON_VERSION=3.12

# Basic tools, firewall tools (used by init-firewall.sh), shellcheck,
# and Cypress system dependencies (https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites)
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates curl git less procps sudo nano \
  iptables ipset iproute2 dnsutils aggregate jq \
  shellcheck \
  xvfb libgtk2.0-0t64 libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 libxss1 \
  libasound2t64 libxtst6 xauth \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Yarn: the repo uses Yarn 1 (classic, yarn.lock v1, no packageManager field),
# which the node image already ships in /usr/local/bin, so no corepack.

# Bun: used by the build script (tools/scripts/build.mjs) and the unit tests (bun test)
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

# uv, and a uv-managed Python in a shared location (not /root) so the user can use it
COPY --from=uv /uv /uvx /usr/local/bin/
ENV UV_PYTHON_INSTALL_DIR=/opt/python UV_PYTHON="$PYTHON_VERSION" UV_PYTHON_DOWNLOADS=never
RUN UV_PYTHON_DOWNLOADS=automatic uv python install "$PYTHON_VERSION" \
  && ln -s "$(uv python find "$PYTHON_VERSION")" /usr/local/bin/python3 \
  && ln -s /usr/local/bin/python3 /usr/local/bin/python

# Workspace, node_modules volume mount point, Claude config dir, and persisted shell history
RUN mkdir -p /workspace/node_modules /commandhistory "/home/$USERNAME/.claude" \
  && touch /commandhistory/.bash_history \
  && chown -R "$USERNAME:$USERNAME" /workspace /commandhistory "/home/$USERNAME/.claude" \
  && echo "export PROMPT_COMMAND='history -a' HISTFILE=/commandhistory/.bash_history" >> "/home/$USERNAME/.bashrc"

# Firewall script: the user may run this one script as root, nothing else
COPY .devcontainer/init-firewall.sh .devcontainer/check-isolation.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/init-firewall.sh /usr/local/bin/check-isolation.sh \
  && echo "$USERNAME ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/firewall \
  && chmod 0440 /etc/sudoers.d/firewall

ENV DEVCONTAINER=true
ENV PATH="/home/${USERNAME}/.local/bin:${PATH}"

WORKDIR /workspace
USER $USERNAME

# Claude Code native installer; installs to ~/.local/bin
RUN curl -fsSL https://claude.ai/install.sh | bash -s "$CLAUDE_CODE_VERSION"
