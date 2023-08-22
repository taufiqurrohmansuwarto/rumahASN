import {
  deletePolling,
  detailPolling,
  updatePolling,
} from "@/controller/polls.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .delete(deletePolling)
  .patch(updatePolling)
  .get(detailPolling);

export default router.handler({});
