import { getParticipantsMeeting } from "@/controller/zoom.controller";
import zoomMiddleware from "@/middleware/zoom.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(zoomMiddleware).get(getParticipantsMeeting);

export default router.handler();
