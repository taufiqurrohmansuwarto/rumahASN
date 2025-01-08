import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import {
  getRekonUnorReport,
  getSIASNUnor,
} from "@/controller/rekon.controller";

const router = createRouter();

// router.use(auth).use(adminFasilitatorMiddleware).get(getRekonUnorReport);
router.use(auth).use(adminFasilitatorMiddleware).get(getSIASNUnor);

export default router.handler();
