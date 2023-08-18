import {
  createPost,
  getPost,
  removePost,
  updatePost,
} from "@/controller/discussions.controller";
import auth from "@/middleware/auth.middleware";
import employeesMiddleware from "@/middleware/employees.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(employeesMiddleware)
  .post(createPost)
  .get(getPost)
  .patch(updatePost)
  .delete(removePost);

export default router.handler({});
