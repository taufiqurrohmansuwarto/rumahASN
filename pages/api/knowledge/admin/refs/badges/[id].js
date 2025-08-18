import {
  deleteBadges,
  updateBadges,
} from "@/controller/knowledge/gamification.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).put(updateBadges).delete(deleteBadges);

export default router.handler;
