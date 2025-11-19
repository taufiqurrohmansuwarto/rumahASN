import { getProxyPangkat } from "@/controller/siasn/proxy-siasn/proxy-pangkat.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getProxyPangkat);

export default router.handler();
