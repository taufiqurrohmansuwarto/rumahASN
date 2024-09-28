import {
  getScheduleVisitById,
  updateScheduleVisit,
  deleteScheduleVisit,
} from "@/controller/guests-books.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .get(getScheduleVisitById)
  .patch(updateScheduleVisit)
  .delete(deleteScheduleVisit);

export default router.handler({});
