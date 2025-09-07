import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { 
  deleteNotification,
  updateNotification 
} from "@/controller/knowledge/knowledge-admin-notifications.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).delete(deleteNotification).put(updateNotification);

export default router.handler();
