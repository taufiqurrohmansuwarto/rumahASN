import {
  deleteComment,
  getComment,
  updateComment,
} from "@/controller/asn-discussions.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .get(getComment)
  .delete(deleteComment)
  .patch(updateComment);

export default router.handler();
