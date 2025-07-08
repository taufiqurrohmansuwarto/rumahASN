import {
  deleteAllAnomali,
  getAnomali2022,
} from "@/controller/anomali.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getAnomali2022)
  .delete(deleteAllAnomali);

export default router.handler({});
