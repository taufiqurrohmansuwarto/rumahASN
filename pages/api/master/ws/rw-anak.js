import { rwAnakMaster } from "@/controller/master.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMiddleware).get(rwAnakMaster);

export default router.handler({});
