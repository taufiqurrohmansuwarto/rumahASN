import {
  announcements,
  createAnnouncement,
} from "@/controller/announcements-poolings.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(announcements).post(createAnnouncement);

export default router.handler();
