import { createRouter } from "next-connect";
import { reprocessContentAI } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.post(reprocessContentAI);

export default router.handler({});