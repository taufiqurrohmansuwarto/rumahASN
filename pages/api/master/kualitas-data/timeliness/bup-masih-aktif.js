import { bupMasihAktif } from "@/controller/kualitas-data/timeliness.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(bupMasihAktif);

export default router.handler();
