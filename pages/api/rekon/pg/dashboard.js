import { getRekonPGJatim } from "@/controller/rekon/rekon-pencantuman-gelar.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getRekonPGJatim);

export default router.handler({});
