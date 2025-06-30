import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { syncRekonStruktural, getJobStatus, getAllJobsStatus } from "@/controller/rekon/rekon-struktural.controller";
import { siasnMiddleware } from "@/middleware/siasn.middleware";

const router = createRouter();

router
  .use(auth)
  .use(siasnMiddleware)
  .use(adminMiddleware)
  .get(syncRekonStruktural)
  .post(syncRekonStruktural); // Allow both GET and POST for flexibility

export default router.handler();
