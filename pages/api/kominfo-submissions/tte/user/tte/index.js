import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import {
  createPengajuanTTE,
  getPengajuanTTE,
} from "@/controller/tte-submission/tte-submission.controller";

router
  .use(auth)
  .use(asnMiddleware)
  .post(createPengajuanTTE)
  .get(getPengajuanTTE);

export default router.handler({});
