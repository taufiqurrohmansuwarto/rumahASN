import adminMiddleware from "@/middleware/admin.middleware";
import {
  getRedisKeyById,
  deleteRedisKeyById,
} from "@/controller/redis.controller";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getRedisKeyById)
  .delete(deleteRedisKeyById);

export default router.handler({});
