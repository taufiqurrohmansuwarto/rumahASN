import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import { checkSubmissionStatus } from "@/controller/tte-submission/email-submission.controller";

router.use(auth).use(asnMiddleware).get(checkSubmissionStatus);

export default router.handler({});
