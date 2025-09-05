import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { getPendingRevisions } from "@/controller/knowledge/knowledge-revisions.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getPendingRevisions);

export default router.handler();
