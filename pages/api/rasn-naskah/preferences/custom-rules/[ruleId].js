import { removeCustomRule } from "@/controller/rasn-naskah/preferences.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).delete(removeCustomRule);

export default router.handler({});

