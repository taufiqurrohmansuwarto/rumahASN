import {
  getSubmissionReference,
  createSubmissionReference,
} from "@/controller/submissions.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();
router
  .use(auth)
  .use(adminMiddleware)
  .get(getSubmissionReference)
  .post(createSubmissionReference);

export default router.handler({});
