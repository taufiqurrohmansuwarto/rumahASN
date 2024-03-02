import {
  createPretest,
  findPretest,
} from "@/controller/webinar-series-pretests.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(findPretest).post(createPretest);

export default router.handler({});
