import {
  commentUserDelete,
  commentUserUpdate,
} from "@/controller/webinar-series-comments.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).patch(commentUserUpdate).delete(commentUserDelete);

export default router.handler({});
