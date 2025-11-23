import { allPnsByNip } from "@/controller/siasn.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { apiErrorHandler } from "@/utils/api-handler";
const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(allPnsByNip);

export default router.handler(apiErrorHandler);
