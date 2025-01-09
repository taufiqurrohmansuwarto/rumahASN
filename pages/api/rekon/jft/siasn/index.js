import { createRouter } from "next-connect";
import { getJftSiasn } from "@/controller/rekon.controller";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getJftSiasn);

export default router.handler();
