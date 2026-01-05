import {
  getDocumentRevisionAdmin,
  updateDocumentRevisionStatus,
} from "@/controller/pengadaan/document-revisions.controller";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getDocumentRevisionAdmin)
  .patch(updateDocumentRevisionStatus);

export default router.handler({});
