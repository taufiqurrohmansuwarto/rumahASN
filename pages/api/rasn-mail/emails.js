import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";

const router = createRouter();

router.use(auth).use(asnNonAsnFasilitatorMiddleware).get();

export default router.handler({});
