import {
  downvoteDiscussion,
  upvoteDiscussion,
} from "@/controller/asn-discussions.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .put(upvoteDiscussion)
  .delete(downvoteDiscussion);

export default router.handler();
