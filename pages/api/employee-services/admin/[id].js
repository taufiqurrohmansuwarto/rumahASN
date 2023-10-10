import {
  detailEmployeeService,
  removeEmployeeService,
  updateEmployeeService,
} from "@/controller/employee-services.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(detailEmployeeService)
  .patch(updateEmployeeService)
  .delete(removeEmployeeService);

export default router.handler();
