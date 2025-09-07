import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { getAllNotifications } from "@/controller/knowledge/knowledge-admin-notifications.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getAllNotifications);

export default router.handler();
