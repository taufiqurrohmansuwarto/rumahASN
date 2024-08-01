import {
  createComment,
  getComments,
} from "@/controller/asn-discussions.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .get(getComments)
  .post(createComment);

export default router.handler();
