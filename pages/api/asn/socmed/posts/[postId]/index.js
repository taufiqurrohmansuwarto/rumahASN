import {
  detailPost,
  removePost,
  updatePost,
} from "@/controller/social-media.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .get(detailPost)
  .patch(updatePost)
  .delete(removePost);

export default router.handler();
