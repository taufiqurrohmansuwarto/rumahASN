import { listPodcastUser } from "@/controller/podcast.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(listPodcastUser);

export default router.handler();
