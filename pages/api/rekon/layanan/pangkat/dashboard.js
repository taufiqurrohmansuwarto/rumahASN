import { getRekonPangkatJatim } from "@/controller/rekon/rekon-pangkat.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(getRekonPangkatJatim);

export default router.handler({});
