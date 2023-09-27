import {
  getJabatanByNip,
  postRiwayatJabatanByNip,
} from "@/controller/siasn.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(siasnMiddleware)
  .get(getJabatanByNip)
  .post(postRiwayatJabatanByNip);

export default router.handler();
