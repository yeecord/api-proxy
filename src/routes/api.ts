import { cache, createCacheKey } from "../utils";

interface CachedResponse {
  headers: [string, string][];
  body: string | null;
}

export async function handleApiRequest(request: Request, url: URL) {
  url.hostname = "discord.com";
  url.port = "443";
  url.protocol = "https:";

  request.headers.set("Host", "discord.com");

  if (request.method !== "GET") {
    return fetch(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  const cacheKey = createCacheKey(request);

  const existing = (await cache.get(cacheKey)) as CachedResponse | undefined;

  if (existing) {
    return new Response(existing.body, {
      headers: new Headers(existing.headers),
    });
  }

  const response = await fetch(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  const content = response.status === 204 ? null : await response.text();

  await cache.set(cacheKey, {
    headers: [...response.headers.entries()],
    body: content,
  } satisfies CachedResponse);

  return new Response(content, {
    headers: response.headers,
  });
}
