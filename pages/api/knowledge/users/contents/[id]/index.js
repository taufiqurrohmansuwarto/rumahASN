import { createRouter } from "next-connect";
import {
  getKnowledgeContent,
  updateKnowledgeContentPersonal,
} from "@/controller/knowledge/knowledge-contents.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(getKnowledgeContent)
  .patch(updateKnowledgeContentPersonal);

export default router.handler({});
