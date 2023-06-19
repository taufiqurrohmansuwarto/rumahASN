import {
  deleteCommentPodcast,
  detailCommentPodcast,
  updateCommentPodcast,
} from "@/controller/podcasts-comments.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .get(detailCommentPodcast)
  .delete(deleteCommentPodcast)
  .patch(updateCommentPodcast);

export default router.handler();
