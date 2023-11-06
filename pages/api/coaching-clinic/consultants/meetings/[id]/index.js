import {
  removeMeeting,
  updateMeeting,
  getMeeting,
} from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import ccConsultantMiddleware from "@/middleware/cc-consultant.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(ccConsultantMiddleware)
  .get(getMeeting)
  .patch(updateMeeting)
  .delete(removeMeeting);

export default router.handler();
