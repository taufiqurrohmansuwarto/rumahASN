import { createRouter } from "next-connect";
import { testTagGeneration } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.post(testTagGeneration);

export default router.handler({});
