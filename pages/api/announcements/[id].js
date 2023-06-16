import {
  removeAnnouncement,
  updateAnnouncement,
} from "@/controller/announcements-poolings.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).patch(updateAnnouncement).delete(removeAnnouncement);

export default router.handler();
