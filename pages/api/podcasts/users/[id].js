import { detailPodcastUser } from "@/controller/podcast.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(detailPodcastUser);

export default router.handler();
