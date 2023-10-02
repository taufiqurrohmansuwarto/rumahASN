import { patchUserAnomali } from "@/controller/anomali.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnMiddleware).patch(patchUserAnomali);

export default router.handler({});
