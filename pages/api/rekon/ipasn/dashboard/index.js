import { dashboardSiasnIPASN } from "@/controller/rekon/rekon-ipasn.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(dashboardSiasnIPASN);

export default router.handler({});
