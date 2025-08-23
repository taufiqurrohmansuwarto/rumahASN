import {
  getKnowledgeContentAdmin,
  updateKnowledgeContentAdmin,
} from "@/controller/knowledge/knowledge-contents-admin.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getKnowledgeContentAdmin)
  .patch(updateKnowledgeContentAdmin);

export default router.handler();
