import { proxyRekapPengadaanStats } from "@/controller/siasn-pengadaan.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(proxyRekapPengadaanStats);

export default router.handler();
