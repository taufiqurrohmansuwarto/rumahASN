import {
  deleteWebinar,
  detailWebinarAdmin,
  updateWebinar,
} from "@/controller/webinar-series.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(detailWebinarAdmin)
  .patch(updateWebinar)
  .delete(deleteWebinar);

export default router.handler({});
