import {
  detailSubmissionReference,
  updateSubmissionReference,
  deleteSubmissionReference,
} from "@/controller/submissions.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();
router
  .use(auth)
  .use(adminMiddleware)
  .get(detailSubmissionReference)
  .patch(updateSubmissionReference)
  .delete(deleteSubmissionReference);

export default router.handler({});
