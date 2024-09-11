import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import {
  getPerencanaanUsulan,
  createPerencanaanUsulan,
} from "@/controller/perencanaan.controller";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getPerencanaanUsulan)
  .post(createPerencanaanUsulan);

export default router.handler();
