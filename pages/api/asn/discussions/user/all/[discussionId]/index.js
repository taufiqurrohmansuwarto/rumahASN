import {
  createDiscussion,
  getDiscussion,
} from "@/controller/asn-discussions.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .get(getDiscussion)
  .post(createDiscussion);

export default router.handler();
