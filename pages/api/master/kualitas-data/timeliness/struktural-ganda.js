import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import { strukturalGanda } from "@/controller/kualitas-data/timeliness.controller";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(strukturalGanda);

export default router.handler();
