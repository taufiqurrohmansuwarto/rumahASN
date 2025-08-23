import {
  getKnowledgeCategories,
  createKnowledgeCategory,
} from "@/controller/knowledge/knowledge-categories.controller.js";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getKnowledgeCategories)
  .post(createKnowledgeCategory);

export default router.handler();
