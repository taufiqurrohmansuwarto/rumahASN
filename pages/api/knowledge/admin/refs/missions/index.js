import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import {
  getMissions,
  createMissions,
} from "@/controller/knowledge/gamification.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getMissions).post(createMissions);

export default router.handler();
