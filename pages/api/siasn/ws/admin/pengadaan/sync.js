import { syncPengadaan } from "@/controller/siasn-pengadaan.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).use(siasnMiddleware).get(syncPengadaan);

export default router.handler({});
