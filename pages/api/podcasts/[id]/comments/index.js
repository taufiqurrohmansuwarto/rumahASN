import {
  commentsPodcasts,
  createCommentPodcast,
} from "@/controller/podcasts-comments.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(commentsPodcasts).post(createCommentPodcast);

export default router.handler();
