import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import {
  getMissionById,
  updateMissions,
  deleteMission,
} from "@/controller/knowledge/gamification.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getMissionById)
  .patch(updateMissions)
  .delete(deleteMission);

export default router.handler();
