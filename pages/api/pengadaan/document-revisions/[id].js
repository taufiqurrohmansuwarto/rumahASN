import {
  getDocumentRevision,
  cancelDocumentRevision,
} from "@/controller/pengadaan/document-revisions.controller";
import auth from "@/middleware/auth.middleware";
import asnMasterMiddleware from "@/middleware/asn-master.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnMasterMiddleware)
  .get(getDocumentRevision)
  .delete(cancelDocumentRevision);

export default router.handler({});
