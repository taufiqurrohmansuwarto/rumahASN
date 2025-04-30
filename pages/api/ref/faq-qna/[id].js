import {
  deleteFaqQna,
  getFaqQna,
  updateFaqQna,
} from "@/controller/faq-qna.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getFaqQna)
  .patch(updateFaqQna)
  .delete(deleteFaqQna);

export default router.handler();
