import { indexLogUsersPreferences } from "@/controller/logs.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(indexLogUsersPreferences);

export default router.handler();
