import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

import { syncJabatanByNip } from "@/controller/siasn-proxy.controller";

router.use(auth).use(adminFasilitatorMiddleware).get(syncJabatanByNip);

export default router.handler();
