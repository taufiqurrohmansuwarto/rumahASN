import {
  downvoteDiscussion,
  upvoteDiscussion,
} from "@/controller/asn-discussions.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .put(upvoteDiscussion)
  .delete(downvoteDiscussion);

export default router.handler();
