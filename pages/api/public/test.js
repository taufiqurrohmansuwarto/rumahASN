import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createEdgeRouter, json } from "@/utils/edge-router";
import {
  authEdgeMiddleware,
  asnNonAsnEdgeMiddleware,
} from "@/middleware/auth-edge.middleware";

export const config = {
  runtime: "edge",
};

const router = createEdgeRouter();

router
  .use(authEdgeMiddleware)
  .use(asnNonAsnEdgeMiddleware)
  .get(async (ctx) => {
    // ctx.user tersedia dari middleware
    //     console.log("User:", ctx.user);
    //     const result = streamText({
    //       model: openai("gpt-4-turbo"),
    //       messages: [{ role: "user", content: "Hello, how are you?" }],
    //     });
    //     return result.toDataStreamResponse();
  })
  .post(async (ctx) => {
    //     const body = await ctx.req.json();
    //     const { messages } = body;
    //     const result = streamText({
    //       model: openai("gpt-4-turbo"),
    //       messages: messages || [{ role: "user", content: "Hello!" }],
    //     });
    //     return result.toDataStreamResponse();
  })
  .patch(async (ctx) => {
    const body = await ctx.req.json();
    return json({ message: "PATCH success", data: body, user: ctx.user });
  })
  .delete(async (ctx) => {
    return json({ message: "DELETE success", user: ctx.user });
  });

export default router.handler();
