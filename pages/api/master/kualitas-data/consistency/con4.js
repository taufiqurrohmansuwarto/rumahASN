import { tahunPengangkatanPPPK } from "@/controller/kualitas-data/consistentcy.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(tahunPengangkatanPPPK);

export default router.handler();
