import {
  createCacheKey,
  createResponseFromCached,
  getCachedResponse,
  setCachedResponse,
} from "../cache";

const requestMap = new Map<bigint, Promise<Response>>();

export async function handleApiRequest(request: Request, url: URL) {
  url.hostname = "discord.com";
  url.port = "443";
  url.protocol = "https:";

  request.headers.set("Host", "discord.com");

  if (request.method !== "GET" && request.method !== "HEAD") {
    return fetchFromRequest(url, request);
  }

  const cacheKey = createCacheKey(request);

  const existingCache = getCachedResponse(cacheKey);

  if (existingCache) {
    return createResponseFromCached(existingCache);
  }

  const existingRequest = requestMap.get(cacheKey);

  if (existingRequest) {
    return existingRequest;
  }

  const promise = makeRequest(cacheKey, url, request).finally(() => {
    requestMap.delete(cacheKey);
  });

  requestMap.set(cacheKey, promise);

  return promise;
}

async function makeRequest(cacheKey: bigint, url: URL, request: Request) {
  const response = await fetchFromRequest(url, request);

  const content =
    response.status === 204
      ? undefined
      : new Uint8Array(await response.arrayBuffer());

  const cachedResponse = {
    key: cacheKey,
    body: content,
    contentType: response.headers.get("Content-Type") ?? undefined,
    status: response.status,
  };

  setCachedResponse(cachedResponse);

  return createResponseFromCached(cachedResponse);
}

function fetchFromRequest(url: URL, request: Request) {
  return fetch(url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    signal: AbortSignal.timeout(10_000),
  });
}
