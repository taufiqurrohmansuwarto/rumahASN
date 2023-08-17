import {
  createComment,
  removeComment,
  updateComment,
} from "@/controller/discussions.controller";
import auth from "@/middleware/auth.middleware";
import employeesMiddleware from "@/middleware/employees.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(employeesMiddleware)
  .post(createComment)
  .patch(updateComment)
  .delete(removeComment);

export default router.handler({});
