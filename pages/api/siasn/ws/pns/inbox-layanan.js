import { inboxLayanan } from "@/controller/layanan.controller";
import { createRouter } from "next-connect";
import asnMasterMiddleware from "@/middleware/asn-master.middleware";

import auth from "@/middleware/auth.middleware";
const router = createRouter();

router.use(auth).use(asnMasterMiddleware).get(inboxLayanan);

export default router.handler();
