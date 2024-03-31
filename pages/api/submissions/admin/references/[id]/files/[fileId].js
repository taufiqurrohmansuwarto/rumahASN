import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import {
  detailSubmissionWithFiles,
  updateSubmissionWithFiles,
  deleteSubmissionWithFiles,
} from "@/controller/submissions.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(detailSubmissionWithFiles)
  .patch(updateSubmissionWithFiles)
  .delete(deleteSubmissionWithFiles);

export default router.handler({});
