import { daftarPasangan } from "@/controller/siasn-keluarga.controller";
import { postIstriPersonal } from "@/controller/siasn/rw-keluarga.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .use(siasnMiddleware)
  .get(daftarPasangan)
  .post(postIstriPersonal);

export default router.handler();
