import {
  getSkp2022ByNip,
  postSkp2022ByNip,
} from "@/controller/siasn.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnMiddleware)
  .get(getSkp2022ByNip)
  .post(postSkp2022ByNip);

export default router.handler();