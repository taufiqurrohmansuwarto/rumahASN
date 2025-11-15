import { getProxySkk } from "@/controller/siasn/proxy-siasn/proxy-skk.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getProxySkk);

export default router.handler();

