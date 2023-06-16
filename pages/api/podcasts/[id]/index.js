import {
  removePodcast,
  updatePodcast,
  detailPodcast,
} from "@/controller/podcast.controller";

import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).patch(updatePodcast).delete(removePodcast).get(detailPodcast);

export default router.handler();
