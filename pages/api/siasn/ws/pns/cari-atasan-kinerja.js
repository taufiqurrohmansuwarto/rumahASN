import { cariAtasanKinerja } from "@/controller/ekinerja.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMiddleware).get(cariAtasanKinerja);

export default router.handler();
