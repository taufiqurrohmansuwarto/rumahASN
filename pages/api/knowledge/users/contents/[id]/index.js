import { createRouter } from "next-connect";
import { getKnowledgeContent } from "@/controller/knowledge/knowledge-contents.controller";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(getKnowledgeContent);

export default router.handler({});
