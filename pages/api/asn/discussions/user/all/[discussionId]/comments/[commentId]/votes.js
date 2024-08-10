import {
  downvoteComment,
  upvoteComment,
} from "@/controller/asn-discussions.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .put(upvoteComment)
  .delete(downvoteComment);

export default router.handler();
