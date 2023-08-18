import { createThread, getThreads } from "@/controller/discussions.controller";
import auth from "@/middleware/auth.middleware";
import employeesMiddleware from "@/middleware/employees.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(employeesMiddleware).get(getThreads).post(createThread);

export default router.handler({});
