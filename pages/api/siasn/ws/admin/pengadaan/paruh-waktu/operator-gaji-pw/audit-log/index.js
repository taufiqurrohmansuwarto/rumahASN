import { getAuditLogPengadaanParuhWaktu } from "@/controller/paruh-waktu.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getAuditLogPengadaanParuhWaktu);

export default router.handler({});
