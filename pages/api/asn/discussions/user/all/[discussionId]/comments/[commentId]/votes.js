import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import {
  downvoteComment,
  upvoteComment,
} from "@/controller/asn-discussions.controller";
const router = createRouter();

router.use(auth).use(asnMiddleware).put(upvoteComment).delete(downvoteComment);

export default router.handler();
