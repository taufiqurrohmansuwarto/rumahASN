import {
  deleteMeeting,
  joinMeeting,
} from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).put(joinMeeting).delete(deleteMeeting);

export default router.handler();
