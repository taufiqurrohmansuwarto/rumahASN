import { resyncFaqQna } from "@/controller/faq-qna.controller";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(resyncFaqQna);

export default router.handler();
