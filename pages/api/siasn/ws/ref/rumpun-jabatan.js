import {
  findRumpunJabatan,
  syncRumpunJabatan,
} from "@/controller/ref-siasn.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .use(siasnMiddleware)
  .get(findRumpunJabatan)
  .put(syncRumpunJabatan);

export default router.handler();
