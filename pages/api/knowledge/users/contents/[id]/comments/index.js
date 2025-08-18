import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import {
  createComment,
  removeComment,
  getComments,
} from "@/controller/knowledge/user-interactions.controller";

const router = createRouter();

router.use(auth).post(createComment).get(getComments);

export default router.handler({});
