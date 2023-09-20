import { downloadRating } from "@/controller/webinar-series-report.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(downloadRating);

export default router.handler({});
