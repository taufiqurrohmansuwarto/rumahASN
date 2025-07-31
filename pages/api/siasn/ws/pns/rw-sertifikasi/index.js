import {
  createSertifikasiPersonal,
  getSertifikasPersonal,
} from "@/controller/siasn/rw-sertifkasi.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .use(siasnMiddleware)
  .get(getSertifikasPersonal)
  .post(createSertifikasiPersonal);

export default router.handler();
