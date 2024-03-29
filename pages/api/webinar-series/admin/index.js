import {
  createWebinar,
  listAdmin,
} from "@/controller/webinar-series.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(listAdmin).post(createWebinar);

export default router.handler({});
