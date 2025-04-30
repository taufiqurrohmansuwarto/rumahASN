import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { exportFineTunning } from "@/controller/fine-tunning.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(exportFineTunning);

export default router.handler();
