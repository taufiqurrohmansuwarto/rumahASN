import {
  getSkp2022ByNip,
  postSkp2022ByNip,
} from "@/controller/siasn.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .use(siasnMiddleware)
  .get(getSkp2022ByNip)
  .post(postSkp2022ByNip);

export default router.handler();
