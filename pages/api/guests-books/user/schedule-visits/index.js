import {
  getScheduleVisits,
  createScheduleVisit,
} from "@/controller/guests-books.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getScheduleVisits).post(createScheduleVisit);

export default router.handler({});
