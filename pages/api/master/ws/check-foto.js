import { checkFotoPersonal } from "@/controller/microservices/ocr.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMiddleware).post(checkFotoPersonal);

export default router.handler({});
