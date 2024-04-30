import { checkDocumentByNip } from "@/controller/documents.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(checkDocumentByNip);

export default router.handler();
