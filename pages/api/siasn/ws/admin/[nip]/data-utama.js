import { updateDataUtamaByNip } from "@/controller/siasn-data-utama.controller";
import { siasnEmployeeDetailByNip } from "@/controller/siasn.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(siasnMiddleware)
  .post(updateDataUtamaByNip)
  .get(siasnEmployeeDetailByNip);

export default router.handler();
