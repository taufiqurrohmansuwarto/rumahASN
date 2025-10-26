import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import { submitPengajuanTTE } from "@/controller/tte-submission/tte-submission.controller";

router.use(auth).use(asnMiddleware).post(submitPengajuanTTE);

export default router.handler({});
