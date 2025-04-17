import { listMfa } from "@/controller/siasn-mfa.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(listMfa);

export default router.handler();
