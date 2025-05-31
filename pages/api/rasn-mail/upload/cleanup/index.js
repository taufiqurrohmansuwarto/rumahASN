import { cleanupUnusedFiles } from "@/controller/rasn-mail/upload.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnFasilitatorMiddleware).post(cleanupUnusedFiles);

export default router.handler({});
