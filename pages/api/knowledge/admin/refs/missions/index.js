import {
  createMissions,
  getMissions,
} from "@/controller/knowledge/gamification.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getMissions).post(createMissions);

export default router.handler;
