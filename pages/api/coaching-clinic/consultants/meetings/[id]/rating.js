import { getRatingMeetingConsultant } from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import ccConsultantMiddleware from "@/middleware/cc-consultant.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(ccConsultantMiddleware).get(getRatingMeetingConsultant);

export default router.handler();
