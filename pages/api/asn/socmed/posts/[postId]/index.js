import {
  detailPost,
  removePost,
  updatePost,
} from "@/controller/social-media.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .get(detailPost)
  .patch(updatePost)
  .delete(removePost);

export default router.handler();
