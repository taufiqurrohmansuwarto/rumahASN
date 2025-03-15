import { syncStatusUsul } from "@/controller/rekon/rekon-status-usul.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(syncStatusUsul);

export default router.handler({});
