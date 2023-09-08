import {
  commentUserCreate,
  commentUserIndex,
} from "@/controller/webinar-series-comments.controller";
import auth from "@/middleware/auth.middleware";
import webinarUserTypeMiddleware from "@/middleware/webinar-user-type.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(webinarUserTypeMiddleware)
  .get(commentUserIndex)
  .post(commentUserCreate);

export default router.handler({});
