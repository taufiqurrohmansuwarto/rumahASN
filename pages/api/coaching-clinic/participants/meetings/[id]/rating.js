import {
  giveRatingMeeting,
  ratingMeetingParticipant,
} from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).put(giveRatingMeeting).get(ratingMeetingParticipant);

export default router.handler();
