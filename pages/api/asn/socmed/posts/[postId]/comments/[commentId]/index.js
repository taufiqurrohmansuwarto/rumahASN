import {
  removeComment,
  updateComment,
} from "@/controller/social-media.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).patch(updateComment).delete(removeComment);

export default router.handler();
