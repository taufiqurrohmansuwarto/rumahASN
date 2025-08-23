import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import {
  getKnowledgeContentAdmin,
  updateKnowledgeContentAdmin,
  deleteKnowledgeContentAdmin,
} from "@/controller/knowledge/knowledge-contents-admin.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getKnowledgeContentAdmin)
  .patch(updateKnowledgeContentAdmin)
  .delete(deleteKnowledgeContentAdmin);

export default router.handler();
