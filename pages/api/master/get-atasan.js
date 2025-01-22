import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { getAtasan } from "@/controller/master.controller";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getAtasan);

export default router.handler();
