import adminMiddleware from "@/middleware/admin.middleware";
import {
  getAllRedisKeys,
  deleteAllRedisKeys,
} from "@/controller/redis.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getAllRedisKeys)
  .delete(deleteAllRedisKeys);

export default router.handler({});
