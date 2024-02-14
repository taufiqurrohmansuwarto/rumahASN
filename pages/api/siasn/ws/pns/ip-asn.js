import { getIpAsn } from "@/controller/siasn-pengembangan-kompentensi.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMiddleware).get(getIpAsn);

export default router.handler();
