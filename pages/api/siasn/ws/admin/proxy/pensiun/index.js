import { getProxyPensiun } from "@/controller/siasn/proxy-siasn/proxy-pensiun.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getProxyPensiun);

export default router.handler();

