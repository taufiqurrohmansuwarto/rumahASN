import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { summarizeQuestion } from "@/controller/fine-tunning.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(summarizeQuestion);

export default router.handler();
