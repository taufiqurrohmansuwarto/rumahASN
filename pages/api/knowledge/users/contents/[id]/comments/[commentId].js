import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import {
  removeComment,
  updateComment,
} from "@/controller/knowledge/user-interactions.controller";

const router = createRouter();

router.use(auth).delete(removeComment).patch(updateComment);

export default router.handler({});
