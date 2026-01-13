import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import { getAll as getAllAudit } from "@/controller/perencanaan/riwayat_audit.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator).get(getAllAudit);

export default router.handler({});

