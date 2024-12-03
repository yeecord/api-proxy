import { z } from "zod";
import { createCacheKey, invalidateCache } from "../cache";

const schema = z
  .object({
    method: z.enum(["GET", "HEAD"]),
    url: z.string().url(),
    authorization: z.string().optional(),
  })
  .strict();

export async function handleInvalidateRequest(request: Request) {
  const body = schema.parse(await request.json());

  const cacheKey = createCacheKey(body);

  invalidateCache(cacheKey);

  return new Response(null, {
    status: 204,
  });
}
