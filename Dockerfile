FROM docker.io/node:19-alpine

RUN sed -i -e 's/^root::/root:!:/' /etc/shadow
RUN set -xe && apk add --no-cache bash git openssh nano python3 curl gcc g++ make libc-dev
RUN git config --global --add safe.directory /home/app
ENV HOME=/home/node
RUN mkdir -p /home/app
COPY node /home/node
RUN chown -R 1000:1000 /home
USER 1000

RUN cd /home/node && npm i superstatic

WORKDIR /home/app
ENTRYPOINT ["/bin/bash", "/home/node/entrypoint.sh"]

ENV PATH "$PATH:/home/node/npm/bin:/home/app/node_modules/.bin"
