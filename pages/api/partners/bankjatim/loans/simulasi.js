import { simulasi } from "@/controller/bankjatim.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnMiddleware).post(simulasi);

export default router.handler();
