import { botChat } from "@/controller/ai-assistants.controller";
import { createEdgeRouter } from "next-connect";

export const config = {
  runtime: "edge",
};

const router = createEdgeRouter();

router.post(botChat);

export default router.handler({});
