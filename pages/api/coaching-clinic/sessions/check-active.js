import { checkUserHasActiveSession } from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// GET: Cek apakah user punya active session (untuk prevent multiple meetings)
router.use(auth).get(checkUserHasActiveSession);

export default router.handler();
