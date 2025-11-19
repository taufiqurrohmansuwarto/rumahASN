import { getProxyPgProfesi } from "@/controller/siasn/proxy-siasn/proxy-pg-profesi.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getProxyPgProfesi);

export default router.handler();
