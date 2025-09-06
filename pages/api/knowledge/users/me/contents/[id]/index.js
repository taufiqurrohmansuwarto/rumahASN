import {
  getUserKnowledgeContent,
  submitMyContentForReview,
  editMyContent,
  deleteMyContent,
} from "@/controller/knowledge/knowledge-user.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(getUserKnowledgeContent)
  .post(submitMyContentForReview)
  .put(editMyContent)
  .delete(deleteMyContent);

export default router.handler({});
