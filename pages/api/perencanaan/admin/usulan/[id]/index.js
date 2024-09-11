import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import {
  deletePerencanaanUsulan,
  updatePerencanaanUsulan,
} from "@/controller/perencanaan.controller";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .delete(deletePerencanaanUsulan)
  .patch(updatePerencanaanUsulan);

export default router.handler();
