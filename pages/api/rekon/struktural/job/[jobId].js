import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { getJobStatus } from "@/controller/rekon/rekon-struktural.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getJobStatus);

export default router.handler();