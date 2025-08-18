import {
  createBadges,
  getBadges,
} from "@/controller/knowledge/gamification.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getBadges).post(createBadges);

export default router.handler;
