import { redownloadCertificate } from "@/controller/webinar-series.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).delete(redownloadCertificate);

export default router.handler({});
