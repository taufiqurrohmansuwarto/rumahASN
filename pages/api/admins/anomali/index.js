import {
  getAnomali2022,
  patchAnomali2022,
} from "@/controller/anomali.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getAnomali2022)
  .patch(patchAnomali2022);

export default router.handler({});
