import { handleApiRequest } from "./routes/api";
import { handleInvalidateRequest } from "./routes/invalidate";

const server = Bun.serve({
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, url);
    }

    if (url.pathname === "/invalidate" && request.method === "POST") {
      return handleInvalidateRequest(request);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Listening on :${server.port}`);
