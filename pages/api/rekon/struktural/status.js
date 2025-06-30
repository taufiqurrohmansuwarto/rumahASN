import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { getAllJobsStatus } from "@/controller/rekon/rekon-struktural.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getAllJobsStatus);

export default router.handler();