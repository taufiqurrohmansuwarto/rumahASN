import { info } from "@/controller/bankjatim.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(siasnMiddleware).use(asnMiddleware).get(info);

export default router.handler();
