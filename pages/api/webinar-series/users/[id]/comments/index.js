import {
  commentUserCreate,
  commentUserIndex,
} from "@/controller/webinar-series-comments.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(commentUserIndex).post(commentUserCreate);

export default router.handler({});
