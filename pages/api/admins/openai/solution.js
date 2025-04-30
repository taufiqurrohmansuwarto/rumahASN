import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { getSolution } from "@/controller/fine-tunning.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(getSolution);

export default router.handler();
