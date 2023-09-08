import {
  commentUserDelete,
  commentUserUpdate,
} from "@/controller/webinar-series-comments.controller";
import auth from "@/middleware/auth.middleware";
import webinarUserTypeMiddleware from "@/middleware/webinar-user-type.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(webinarUserTypeMiddleware)
  .patch(commentUserUpdate)
  .delete(commentUserDelete);

export default router.handler({});
