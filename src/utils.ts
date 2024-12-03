import { Cache } from "file-system-cache";

export function createCacheKey(request: Request) {
  return `${request.method} ${request.url} ${request.headers.get(
    "Authorization"
  )}`;
}

export const cache = new Cache({
  hash: "sha1",
  ttl: 60 * 5,
});
