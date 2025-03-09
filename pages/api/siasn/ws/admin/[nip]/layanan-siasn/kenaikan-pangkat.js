import { usulanKenaikanPangkatByNipFasilitator } from "@/controller/siasn-usulan.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import checkEmployee from "@/middleware/check-employee.middleware";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .use(checkEmployee)
  .get(usulanKenaikanPangkatByNipFasilitator);

export default router.handler();
