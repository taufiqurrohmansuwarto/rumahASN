import { getRuleTypes } from "@/controller/rasn-naskah/admin.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).use(adminMiddleware).get(getRuleTypes);

export default router.handler({});

