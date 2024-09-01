import { remove, update } from "@/controller/bez-jf.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).patch(update).delete(remove);

export default router.handler();
