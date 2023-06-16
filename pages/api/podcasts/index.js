import { listPodcasts, createPodcast } from "@/controller/podcast.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(listPodcasts).post(createPodcast);

export default router.handler();
