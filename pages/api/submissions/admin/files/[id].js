import {
  deleteSubmissionsFileRefs,
  detailSubmissionsFileRefs,
  updateSubmissionsFileRefs,
} from "@/controller/submissions.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(detailSubmissionsFileRefs)
  .patch(updateSubmissionsFileRefs)
  .delete(deleteSubmissionsFileRefs);

export default router.handler({});
