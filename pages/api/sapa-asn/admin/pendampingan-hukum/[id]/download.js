import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { downloadPendampingan } from "@/controller/sapa-asn/admin/pendampingan-hukum.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(downloadPendampingan);

export default router.handler();

