import { daftarPasanganByNip } from "@/controller/siasn-keluarga.controller";
import { postPasanganByNip } from "@/controller/siasn/rw-keluarga.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(checkEmployee)
  .use(siasnMiddleware)
  .get(daftarPasanganByNip)
  .post(postPasanganByNip);

export default router.handler();
