import asnMiddleware from "@/middleware/asn.middleware";
import { deleteSertifikasiPersonal } from "@/controller/siasn/rw-sertifkasi.controller";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .use(siasnMiddleware)
  .delete(deleteSertifikasiPersonal);

export default router.handler();
