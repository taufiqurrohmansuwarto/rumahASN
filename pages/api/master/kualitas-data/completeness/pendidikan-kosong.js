import { pendidikanKosong } from "@/controller/kualitas-data/completeness.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(pendidikanKosong);

export default router.handler();
