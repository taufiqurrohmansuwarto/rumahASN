import { getAdminContentRevisions } from "@/controller/knowledge/knowledge-revisions.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getAdminContentRevisions);

export default router.handler();
