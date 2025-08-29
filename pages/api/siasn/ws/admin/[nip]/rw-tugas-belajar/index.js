import { daftarTugasBelajarByNip } from "@/controller/siasn/rw-tubel.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(siasnMiddleware)
  .use(checkEmployee)
  .get(daftarTugasBelajarByNip);

export default router.handler();
