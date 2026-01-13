import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import { getById as getAuditById } from "@/controller/perencanaan/riwayat_audit.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator).get(getAuditById);

export default router.handler({});

