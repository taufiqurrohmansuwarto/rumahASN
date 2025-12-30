import { heartbeatVideoSession } from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// POST: Update heartbeat untuk keep session alive
router.use(auth).post(heartbeatVideoSession);

export default router.handler();
