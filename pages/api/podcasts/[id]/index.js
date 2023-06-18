import {
  removePodcast,
  updatePodcast,
  detailPodcast,
} from "@/controller/podcast.controller";

import auth from "@/middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth, checkRole("admin"))
  .patch(updatePodcast)
  .put(removePodcast)
  .get(detailPodcast);

export default router.handler();
