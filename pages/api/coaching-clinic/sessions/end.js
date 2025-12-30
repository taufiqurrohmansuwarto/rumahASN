import { endVideoSession } from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// POST: End video session saat leave/end meeting
router.use(auth).post(endVideoSession);

export default router.handler();
