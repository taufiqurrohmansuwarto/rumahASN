import { getPhone } from "@/controller/tte-submission/email-submission.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMiddleware).get(getPhone);

export default router.handler({});
