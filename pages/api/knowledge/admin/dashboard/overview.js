import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { getDashboardOverview } from "@/controller/knowledge/knowledge-dashboard.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getDashboardOverview);

export default router.handler();
