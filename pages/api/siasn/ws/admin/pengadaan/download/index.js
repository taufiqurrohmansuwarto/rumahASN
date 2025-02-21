import { downloadDokumen } from "@/controller/siasn-pengadaan.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).use(siasnMiddleware).get(downloadDokumen);

export default router.handler({});
