import {
  removeMeeting,
  updateMeeting,
} from "@/controller/coaching-clinic.controller";
import { detailMeeting } from "@/controller/zoom.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(detailMeeting).patch(updateMeeting).delete(removeMeeting);

export default router.handler();
