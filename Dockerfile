FROM node:21.5.0-alpine3.18

ADD . /hansel
RUN cd /hansel && npm install

ENTRYPOINT /hansel/hansel.js
