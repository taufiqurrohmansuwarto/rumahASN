import { giveRatingMeeting } from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).put(giveRatingMeeting);

export default router.handler();
