import { disparitasDataSKP } from "@/controller/disparitas.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(disparitasDataSKP);

export default router.handler();
