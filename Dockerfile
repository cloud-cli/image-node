FROM docker.io/node:lts-alpine

LABEL org.opencontainers.image.source="https://github.com/cloud-cli/image-node"

RUN sed -i -e 's/^root::/root:!:/' /etc/shadow && \
  set -xe && apk add --no-cache bash git openssh nano python3 py3-pip curl gcc g++ make libc-dev && \
  git config --global --add safe.directory /home/app

ENV HOME=/home/node
COPY node /home/node
RUN mkdir -p /home/app
RUN chown -R 1000:1000 /home && chmod -R a+r /home
RUN npm i -g npm@latest pnpm@latest
RUN cd /home/node && npm i --no-audit --no-fund superstatic@latest
RUN chown -R 1000:1000 /home/node/.npm
USER 1000
WORKDIR /home/app
ENTRYPOINT ["/bin/bash", "/home/node/entrypoint.sh"]

ENV PATH="$PATH:/home/node/npm/bin:/home/app/node_modules/.bin"
ENV NODE_OPTIONS="--no-warnings --import file:///home/node/hooks.mjs"
