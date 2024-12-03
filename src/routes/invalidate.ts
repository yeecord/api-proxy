import { z } from "zod";
import { createCacheKey, invalidateCache } from "../cache";

const schema = z.object({
  method: z.string(),
  url: z.string(),
  authorization: z.string().optional(),
});

export async function handleInvalidateRequest(request: Request) {
  const body = schema.parse(await request.json());

  const cacheKey = createCacheKey(body);

  invalidateCache(cacheKey);

  return new Response(null, {
    status: 204,
  });
}
