import {
  deleteBadges,
  updateBadges,
} from "@/controller/knowledge/gamification.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).patch(updateBadges).delete(deleteBadges);

export default router.handler();
