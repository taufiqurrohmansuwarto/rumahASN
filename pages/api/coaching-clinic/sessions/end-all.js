import { endAllMeetingVideoSessions } from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// POST: End all sessions for a meeting (consultant only)
router.use(auth).post(endAllMeetingVideoSessions);

export default router.handler();
