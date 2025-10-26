import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import { checkTTE } from "@/controller/tte-submission/tte-submission.controller";

router.use(auth).use(asnMiddleware).get(checkTTE);

export default router.handler({});
