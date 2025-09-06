import { createRouter } from "next-connect";
import { bulkProcessContents } from "@/controller/knowledge/knowledge-ai.controller";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(bulkProcessContents);

export default router.handler({});
