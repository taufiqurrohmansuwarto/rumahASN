import { getProxyPgAkademik } from "@/controller/siasn/proxy-siasn/proxy-pg-akademik.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getProxyPgAkademik);

export default router.handler();

