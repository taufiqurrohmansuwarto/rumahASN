import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";
import { getFaqQna, createFaqQna } from "@/controller/faq-qna.controller";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getFaqQna).post(createFaqQna);

export default router.handler();
