import asnMasterMiddleware from "@/middleware/asn-master.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { check } from "@/controller/sign-documents.controller";
const router = createRouter();

router.use(auth).use(asnMasterMiddleware).get(check);

export default router.handler();
