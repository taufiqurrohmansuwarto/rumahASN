import { readNotification } from "@/controller/notifications.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

// this gonna be bug if u empty the function
router.use(auth).delete(readNotification);

export default router.handler();
