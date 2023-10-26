import {
  alterUserCoach,
  dropUserCoach,
} from "@/controller/coaching-clinic.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";

const { createRouter } = require("next-connect");

const router = createRouter();

// put make the users coach, and delete make the users not coach
router.use(auth).use(adminMiddleware).put(alterUserCoach).delete(dropUserCoach);

export default router.handler();
