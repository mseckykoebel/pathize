FROM node:18.17.1-bullseye-slim as base
RUN apt-get update && apt-get -y upgrade && apt-get install -y ca-certificates && update-ca-certificates
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
RUN echo "NODE_ENV=${NODE_ENV}"
WORKDIR /app
RUN yarn global add turbo

FROM base as monorepo
COPY . .

FROM monorepo as api-prune
RUN turbo prune --scope=@pathize/api --docker

# fly build target
FROM base AS api-builder
COPY .gitignore .gitignore
COPY --from=api-prune /app/out/json/ .
COPY --from=api-prune /app/out/yarn.lock ./yarn.lock
COPY --from=api-prune /app/.yarn/ ./.yarn/
COPY --from=api-prune /app/.yarnrc.yml .yarnrc.yml
RUN yarn install
COPY --from=api-prune /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn build --filter=@pathize/api

# fly runner target
FROM base as api
COPY --from=api-builder /app .
RUN rm -rf /app/.yarn/cache
EXPOSE 8080
CMD ["yarn", "workspace", "@pathize/api", "start"]