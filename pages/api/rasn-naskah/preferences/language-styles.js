import { getLanguageStyles } from "@/controller/rasn-naskah/preferences.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getLanguageStyles);

export default router.handler({});

