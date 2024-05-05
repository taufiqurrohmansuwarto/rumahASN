import {
  deleteComment,
  getComment,
  updateComment,
} from "@/controller/asn-discussions.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .get(getComment)
  .delete(deleteComment)
  .patch(updateComment);

export default router.handler();
