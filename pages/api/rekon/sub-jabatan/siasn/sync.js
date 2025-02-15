import { syncSubJabatanSiasn } from "@/controller/rekon/rekon-sub-jabatan.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(syncSubJabatanSiasn);

export default router.handler({});
