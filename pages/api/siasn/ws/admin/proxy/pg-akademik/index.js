import { getProxyPgAkademik } from "@/controller/siasn/proxy-siasn/proxy-pg-akademik.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getProxyPgAkademik);

export default router.handler();
