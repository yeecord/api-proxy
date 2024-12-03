ARG BUN_VERSION latest

FROM oven/bun:${BUN_VERSION:-1}-alpine AS base

WORKDIR /app

FROM base AS installer

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile --production

FROM base AS runner

WORKDIR /app

# Install curl for healthcheck
RUN apk update && apk add curl --no-cache

COPY --from=installer /app/node_modules node_modules
COPY . .

ENTRYPOINT ["bun", "run"]

ENV PORT=80

CMD ["start"]