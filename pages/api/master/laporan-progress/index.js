import { getLaporanProgressMaster } from "@/controller/laporan-progress/kelengkapan-data.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getLaporanProgressMaster);
export default router.handler({});
