import { createEvents, getEvents } from "@/controller/events.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(getEvents).post(createEvents);

export default router.handler();
