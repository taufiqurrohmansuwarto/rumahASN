import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { broadcastNotification } from "@/controller/knowledge/knowledge-admin-notifications.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(broadcastNotification);

export default router.handler();
