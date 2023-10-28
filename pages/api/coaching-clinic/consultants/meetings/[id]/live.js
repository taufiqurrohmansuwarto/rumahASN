import {
  endMeeting,
  startMeeting,
} from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).put(startMeeting).delete(endMeeting);

export default router.handler();
