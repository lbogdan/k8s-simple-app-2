FROM node:16.18.0-alpine3.15 AS build

WORKDIR /build

COPY package.json yarn.lock ./

# this is cached as long as package.json and yarn.lock don't change
RUN CHECKSUM="$(md5sum yarn.lock)" && \
    yarn install && \
    if [ "$(md5sum yarn.lock)" != "$CHECKSUM" ]; then \
      echo "ERROR: yarn.lock updated after install" >&2; \
      exit 1; \
    fi

COPY ./ ./

RUN yarn compile && \
    rm dist/.tsbuildinfo && \
    # reinstall node_modules without devDependencies packages
    rm -fr node_modules && \
    yarn install --prod

FROM node:16.18.0-alpine3.15

ARG VERSION
ENV VERSION=$VERSION

WORKDIR /app

# we need this for type: module
COPY package.json ./
# copy build artefacts
COPY --from=build /build/dist/ ./dist/
COPY --from=build /build/node_modules/ ./node_modules/

ENTRYPOINT ["node", "dist/index.js"]
