import {
  detailSubmissionReference,
  updateSubmissionPersonInCharge,
  deleteSubmissionPersonInCharge,
} from "@/controller/submissions.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();
router
  .use(auth)
  .use(adminMiddleware)
  .get(detailSubmissionReference)
  .patch(updateSubmissionPersonInCharge)
  .delete(deleteSubmissionPersonInCharge);

export default router.handler({});
