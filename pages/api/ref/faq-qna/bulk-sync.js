import { bulkSyncToQdrant } from "@/controller/faq-qna.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(bulkSyncToQdrant);

export default router.handler();

