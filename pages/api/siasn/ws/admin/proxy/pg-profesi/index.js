import { getProxyPgProfesi } from "@/controller/siasn/proxy-siasn/proxy-pg-profesi.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getProxyPgProfesi);

export default router.handler();

