import { detailSubmissionReferenceSubmitter } from "@/controller/submissions.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();
router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .get(detailSubmissionReferenceSubmitter);

export default router.handler({});
