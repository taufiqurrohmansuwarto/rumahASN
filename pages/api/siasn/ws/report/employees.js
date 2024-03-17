import {
  showEmployees,
  uploadEmployees,
} from "@/controller/siasn-report.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(showEmployees).post(uploadEmployees);

export default router.handler();
