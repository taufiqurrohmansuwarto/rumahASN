import { getActiveVideoSession } from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// GET: Cek active video session untuk auto-resume
router.use(auth).get(getActiveVideoSession);

export default router.handler();
