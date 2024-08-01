import {
  removeComment,
  updateComment,
} from "@/controller/social-media.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .patch(updateComment)
  .delete(removeComment);

export default router.handler();
