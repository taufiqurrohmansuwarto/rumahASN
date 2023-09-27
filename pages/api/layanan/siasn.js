import { layananTrackingSiasn } from "@/controller/tracking-layanan.controller";
import asnMasterMiddleware from "@/middleware/asn-master.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMasterMiddleware).get(layananTrackingSiasn);

export default router.handler();
