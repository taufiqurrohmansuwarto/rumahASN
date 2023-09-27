import { rwSkpMasterByNip } from "@/controller/master.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(rwSkpMasterByNip);

export default router.handler();
