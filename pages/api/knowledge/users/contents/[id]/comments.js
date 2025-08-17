import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import {
  createComment,
  removeComment,
} from "@/controller/knowledge/user-interactions.controller";

const router = createRouter();

router.use(auth).post(createComment).delete(removeComment);

export default router.handler({});
