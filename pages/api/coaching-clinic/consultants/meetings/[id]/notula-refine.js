import { refineNotula } from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// POST: Rapikan notula dengan AI
router.use(auth).post(refineNotula);

export default router.handler();
