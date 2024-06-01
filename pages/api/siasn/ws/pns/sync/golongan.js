import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { syncGolongan } from "@/controller/siasn-proxy.controller";
const router = createRouter();

router.use(auth).use(asnMiddleware).get(syncGolongan);

export default router.handler();
