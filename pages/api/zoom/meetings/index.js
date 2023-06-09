import { listMeetings, liveMeetings } from "@/controller/zoom.controller";
import auth from "@/middleware/auth.middleware";
import zoomMiddleware from "@/middleware/zoom.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth, zoomMiddleware).get(liveMeetings);

export default router.handler();
