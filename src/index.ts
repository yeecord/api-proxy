import { handleApiRequest } from "./routes/api";

const server = Bun.serve({
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, url);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Listening on :${server.port}`);
