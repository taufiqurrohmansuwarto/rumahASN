import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import {
  getRevisionDetails,
  approveRevision,
} from "@/controller/knowledge/knowledge-revisions.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getRevisionDetails)
  .post(approveRevision);

export default router.handler();
