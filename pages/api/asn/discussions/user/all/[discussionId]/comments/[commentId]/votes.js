import {
  downvoteComment,
  upvoteComment,
} from "@/controller/asn-discussions.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .put(upvoteComment)
  .delete(downvoteComment);

export default router.handler();
