FROM docker.io/node:19-alpine

RUN sed -i -e 's/^root::/root:!:/' /etc/shadow
RUN set -xe && apk add --no-cache bash git openssh nano python3 curl gcc g++ make libc-dev
RUN git config --global --add safe.directory /home/app
ENV HOME=/home/node
RUN mkdir -p /home/app
COPY node /home/node
RUN chown -R node:node /home

RUN (cd /home/node && npm i superstatic)
USER node
WORKDIR /home/app
ENTRYPOINT ["/bin/bash", "/home/node/entrypoint.sh"]

ENV PATH "$PATH:/home/node/npm/bin:/home/app/node_modules/.bin"
ENV PORT 8080
