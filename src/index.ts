import { handleApiRequest } from "./routes/api";

Bun.serve({
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, url);
    }

    return new Response("Not found", { status: 404 });
  },
  port: 3000,
});
