import { generateDokumenSKPengadaan } from "@/controller/generate-dokumen-siasn.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(generateDokumenSKPengadaan);

export default router.handler();
