import { comments, createComment } from "@/controller/social-media.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .get(comments)
  .post(createComment);

export default router.handler();
