import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import { getRekonUnorReport } from "@/controller/rekon.controller";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getRekonUnorReport);

export default router.handler();
