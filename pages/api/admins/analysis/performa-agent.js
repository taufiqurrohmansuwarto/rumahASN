import { agentsPerformances } from "@/controller/analysis.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(agentsPerformances);

export default router.handler({});
