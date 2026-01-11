/**
 * Edge-compatible router dengan pattern mirip next-connect
 * Usage:
 *   const router = createEdgeRouter();
 *   router.use(authEdgeMiddleware).get(getHandler).post(postHandler);
 *   export default router.handler();
 */

export function createEdgeRouter() {
  const middlewares = [];
  const handlers = {};

  const router = {
    use(middleware) {
      middlewares.push(middleware);
      return this;
    },

    get(handler) {
      handlers["GET"] = handler;
      return this;
    },

    post(handler) {
      handlers["POST"] = handler;
      return this;
    },

    put(handler) {
      handlers["PUT"] = handler;
      return this;
    },

    patch(handler) {
      handlers["PATCH"] = handler;
      return this;
    },

    delete(handler) {
      handlers["DELETE"] = handler;
      return this;
    },

    handler() {
      return async (req) => {
        // Create context object (similar to req in express)
        const ctx = {
          req,
          user: null,
          params: {},
          query: Object.fromEntries(new URL(req.url).searchParams),
        };

        // Run middlewares
        for (const middleware of middlewares) {
          const result = await middleware(ctx);

          // If middleware returns a Response, stop and return it
          if (result instanceof Response) {
            return result;
          }

          // If middleware returns false, stop (unauthorized)
          if (result === false) {
            return new Response(
              JSON.stringify({ code: 401, message: "Unauthorized" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }
        }

        // Get handler for this method
        const method = req.method;
        const handler = handlers[method];

        if (!handler) {
          return new Response(
            JSON.stringify({ code: 405, message: "Method Not Allowed" }),
            { status: 405, headers: { "Content-Type": "application/json" } }
          );
        }

        // Run handler
        try {
          return await handler(ctx);
        } catch (error) {
          console.error("Edge Router Error:", error);
          return new Response(
            JSON.stringify({ code: 500, message: "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      };
    },
  };

  return router;
}

/**
 * Helper untuk membuat JSON response
 */
export function json(data, options = {}) {
  const { status = 200, headers = {} } = options;
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}
