import { createRouter } from "next-connect";
import { bulkProcessContents } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.post(bulkProcessContents);

export default router.handler({});