import { getLaporanProgressMasterDetail } from "@/controller/laporan-progress/kelengkapan-data.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getLaporanProgressMasterDetail);
export default router.handler({});
