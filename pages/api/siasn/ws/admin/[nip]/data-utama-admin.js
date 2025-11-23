import { siasnEmployeeDetailByNipAdmin } from "@/controller/siasn.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
import { apiErrorHandler } from "@/utils/api-handler";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnMiddleware)
  .get(siasnEmployeeDetailByNipAdmin);

export default router.handler(apiErrorHandler);
