import {
  downvoteDiscussion,
  upvoteDiscussion,
} from "@/controller/asn-discussions.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .put(upvoteDiscussion)
  .delete(downvoteDiscussion);

export default router.handler();
