import { tmtCpnsNipPNS } from "@/controller/kualitas-data/consistentcy.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(tmtCpnsNipPNS);

export default router.handler();
