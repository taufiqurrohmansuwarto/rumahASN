import { rwPendidikanSIMASTERByNip } from "@/controller/masters.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMiddleware).get(rwPendidikanSIMASTERByNip);

export default router.handler();
