import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import {
  getKnowledgeCategory,
  updateKnowledgeCategory,
  deleteKnowledgeCategory,
} from "@/controller/knowledge/knowledge-categories.controller.js";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getKnowledgeCategory)
  .patch(updateKnowledgeCategory)
  .delete(deleteKnowledgeCategory);

export default router.handler();
