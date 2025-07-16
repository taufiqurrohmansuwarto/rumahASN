import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
import {
  createSertifikasiByNip,
  getSertifikasiByNip,
} from "@/controller/siasn/rw-sertifkasi.controller";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(checkEmployee)
  .use(siasnMiddleware)
  .get(getSertifikasiByNip)
  .post(createSertifikasiByNip);

export default router.handler();
