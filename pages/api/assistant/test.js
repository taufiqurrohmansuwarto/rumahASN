import { assistant } from "@/controller/ai-assistants.controller";
import { createEdgeRouter } from "next-connect";
const router = createEdgeRouter();

export const config = {
  runtime: "edge",
};

router.post(assistant);

export default router.handler({});
