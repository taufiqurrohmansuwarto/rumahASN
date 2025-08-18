import {
  deleteMission,
  updateMissions,
} from "@/controller/knowledge/gamification.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).put(updateMissions).delete(deleteMission);

export default router.handler;
