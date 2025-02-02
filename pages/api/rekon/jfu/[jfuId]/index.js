import { deleteRekonJfu } from "@/controller/rekon/rekon-jfu.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).delete(deleteRekonJfu);

export default router.handler({});
