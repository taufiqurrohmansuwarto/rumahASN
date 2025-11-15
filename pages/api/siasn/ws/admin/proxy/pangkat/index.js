import { getProxyPangkat } from "@/controller/siasn/proxy-siasn/proxy-pangkat.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(getProxyPangkat);

export default router.handler();
