import { getProxyPensiun } from "@/controller/siasn/proxy-siasn/proxy-pensiun.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getProxyPensiun);

export default router.handler();
