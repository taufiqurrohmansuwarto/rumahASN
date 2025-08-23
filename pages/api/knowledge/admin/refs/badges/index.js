import {
  getBadges,
  createBadges,
} from "@/controller/knowledge/gamification.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getBadges).post(createBadges);

export default router.handler();
