import xxhash from "xxhash-wasm";
import { Database } from "bun:sqlite";

const hasher = await xxhash();

const db = new Database("sqlite.db", {
  create: true,
  strict: true,
});

type CachedResponse = {
  key: bigint;
  body?: Uint8Array;
  timestamp: number;
  status: number;
  contentType?: string;
};

db.query(
  `
  CREATE TABLE IF NOT EXISTS cache (
    key INTEGER PRIMARY KEY,
    body BLOB,
    status INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    contentType TEXT
  )
`
).run();

const getCachedQuery = db.prepare<CachedResponse, CachedResponse["key"]>(
  `SELECT * FROM cache WHERE key = ? AND timestamp > (strftime('%s', 'now') - 60 * 5)`
);

const setCachedQuery = db.prepare<
  undefined,
  Omit<CachedResponse, "timestamp">
>(`
  INSERT OR REPLACE INTO cache (key, body, status, contentType, timestamp)
  VALUES ($key, $body, $status, $contentType, strftime('%s', 'now'))
`);

const deleteCachedQuery = db.prepare<undefined, CachedResponse["key"]>(
  `DELETE FROM cache WHERE key = ?`
);

export function getCachedResponse(cacheKey: bigint) {
  return getCachedQuery.get(cacheKey);
}

export function setCachedResponse(
  cachedResponse: Omit<CachedResponse, "timestamp">
) {
  return setCachedQuery.run(cachedResponse);
}

export function createCacheKey(params: {
  method: string;
  url: string;
  authorization?: string;
}) {
  return hasher.h64(
    `${params.method}:${params.url}:${params.authorization ?? ""}`
  );
}

export function createCacheKeyFromRequest(request: Request) {
  return createCacheKey({
    method: request.method,
    url: request.url,
    authorization: request.headers.get("Authorization") ?? undefined,
  });
}

export function createResponseFromCached(
  cached: Omit<CachedResponse, "timestamp" | "key">
) {
  return new Response(cached.body, {
    headers: {
      "Content-Type": cached.contentType ?? "application/octet-stream",
    },
    status: cached.status,
  });
}

export function invalidateCache(cacheKey: bigint) {
  return deleteCachedQuery.run(cacheKey);
}
