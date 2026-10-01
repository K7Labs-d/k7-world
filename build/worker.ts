import handler from "vinext/server/fetch-handler";

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    // This export provides a loopback-only development application. The live
    // Site used a trusted authentication gateway, which is not part of this repo.
    // Keep production closed until you implement and verify your own auth boundary.
    if (!import.meta.env.DEV) {
      return new Response("Production authentication must be configured before deployment.", {
        status: 503,
        headers: { "Cache-Control": "no-store", "Content-Type": "text/plain" },
      });
    }
    return handler.fetch(request, env, ctx);
  },
};
