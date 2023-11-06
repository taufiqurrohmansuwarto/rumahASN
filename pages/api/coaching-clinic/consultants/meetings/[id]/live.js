import {
  endMeeting,
  startMeeting,
} from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import ccConsultantMiddleware from "@/middleware/cc-consultant.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(ccConsultantMiddleware)
  .put(startMeeting)
  .delete(endMeeting);

export default router.handler();
