import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import {
  removeComment,
  updateComment,
} from "@/controller/knowledge/user-interactions.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .delete(removeComment)
  .patch(updateComment);

export default router.handler({});