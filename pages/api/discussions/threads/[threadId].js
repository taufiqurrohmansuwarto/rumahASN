import {
  createThread,
  getThreads,
  removeThread,
  updateThread,
} from "@/controller/discussions.controller";
import auth from "@/middleware/auth.middleware";
import employeesMiddleware from "@/middleware/employees.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(employeesMiddleware)
  .post(createThread)
  .patch(updateThread)
  .get(getThreads)
  .delete(removeThread);

export default router.handler({});
