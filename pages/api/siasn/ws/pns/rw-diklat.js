import { postRiwayatKursus } from "@/controller/siasn-pengembangan-kompentensi.controller";
import { getRwDiklat } from "@/controller/siasn.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .use(siasnMiddleware)
  .get(getRwDiklat)
  .post(postRiwayatKursus);

export default router.handler();
