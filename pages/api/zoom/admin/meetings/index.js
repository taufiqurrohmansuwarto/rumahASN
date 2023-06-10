import { adminListMeetings, createMeeting } from "@/controller/zoom.controller";
import auth from "@/middleware/auth.middleware";
import zoomMiddleware from "@/middleware/zoom.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth, zoomMiddleware).post(createMeeting).get(adminListMeetings);

export default router.handler();
