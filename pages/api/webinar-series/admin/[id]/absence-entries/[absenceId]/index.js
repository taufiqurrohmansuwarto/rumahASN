import {
  deleteAbsenceEntries,
  updateAbsenceEntries,
} from "@/controller/webinar-series-absence-entries.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .patch(updateAbsenceEntries)
  .delete(deleteAbsenceEntries);

export default router.handler({});
