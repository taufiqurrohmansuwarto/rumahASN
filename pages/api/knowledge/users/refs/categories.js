import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { getKnowledgeCategories } from "@/controller/knowledge/knowledge-contents.controller";

const router = createRouter();

router.use(auth).get(getKnowledgeCategories);

export default router.handler({});
