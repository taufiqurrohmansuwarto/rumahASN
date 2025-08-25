import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { getCategoryAnalytics } from "@/controller/knowledge/knowledge-dashboard.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getCategoryAnalytics);

export default router.handler();
