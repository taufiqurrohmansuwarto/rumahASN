import { indexLogSiasnDashboard } from "@/controller/logs.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(indexLogSiasnDashboard);

export default router.handler();
