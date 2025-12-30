import { createVideoSession } from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// POST: Buat video session saat join/start meeting
router.use(auth).post(createVideoSession);

export default router.handler();
