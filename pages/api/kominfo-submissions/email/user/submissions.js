import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import {
  listEmailSubmission,
  createEmailSubmission,
} from "@/controller/tte-submission/email-submission.controller";

router
  .use(auth)
  .use(asnMiddleware)
  .get(listEmailSubmission)
  .post(createEmailSubmission);

export default router.handler({});
