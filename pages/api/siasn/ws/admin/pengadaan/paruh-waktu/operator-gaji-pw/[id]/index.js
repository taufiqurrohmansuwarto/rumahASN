import { deleteOperatorGajiPW } from "@/controller/paruh-waktu.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).delete(deleteOperatorGajiPW);

export default router.handler({});
