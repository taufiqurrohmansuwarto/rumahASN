import { getAllDocumentRevisions } from "@/controller/pengadaan/document-revisions.controller";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getAllDocumentRevisions);

export default router.handler({});
