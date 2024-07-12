import { urlToPdf } from "@/controller/master.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnFasilitatorMiddleware).post(urlToPdf);

export default router.handler();
