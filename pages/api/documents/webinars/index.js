import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import asnMasterMiddleware from "@/middleware/asn-master.middleware";
import { showWebinarSeriesSigner } from "@/controller/webinar-series-signer.controller";

router.use(auth).use(asnMasterMiddleware).get(showWebinarSeriesSigner);

export default router.handler();
