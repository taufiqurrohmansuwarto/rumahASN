import {
  removeComment,
  updateComment,
} from "@/controller/social-media.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .patch(updateComment)
  .delete(removeComment);

export default router.handler();
