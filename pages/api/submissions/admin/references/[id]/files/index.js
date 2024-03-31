import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import {
  createSubmissionWithFiles,
  getSubmissionWithFiles,
} from "@/controller/submissions.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getSubmissionWithFiles)
  .post(createSubmissionWithFiles);

export default router.handler({});
