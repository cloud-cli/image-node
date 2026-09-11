FROM docker.io/node:24-alpine

LABEL org.opencontainers.image.source="https://github.com/cloud-cli/image-node"

RUN sed -i -e 's/^root::/root:!:/' /etc/shadow && \
  set -xe && apk add --no-cache bash git openssh nano python3 py3-pip curl gcc g++ make libc-dev libc6-compat && \
  git config --global --add safe.directory /home/app

ENV PATH "$PATH:/home/node/npm/bin:/home/app/node_modules/.bin:/root/.local/share/pnpm/bin:/home/node/.local/share/pnpm/bin"
ENV HOME=/home/node

COPY node /home/node

RUN mkdir -p /home/app && \
  chown -R 1000:1000 /home && \
  chmod -R a+r /home && \
  npm install --no-audit --no-fund -g --allow-scripts=pnpm,re2 npm@latest foreman@latest superstatic@latest pnpm@12 && \
  cd /home/node && \
  chown -R 1000:1000 /home/node/.npm

RUN pnpm self-update && pnpm i -g foreman superstatic

USER 1000
WORKDIR /home/app
ENTRYPOINT ["/bin/bash", "/home/node/entrypoint.sh"]
ENV NODE_OPTIONS="--no-warnings --import file:///home/node/hooks.mjs"
