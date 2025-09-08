import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { getUserKnowledgeContentsBookmarks } from "@/controller/knowledge/knowledge-user.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(getUserKnowledgeContentsBookmarks);

export default router.handler({});
