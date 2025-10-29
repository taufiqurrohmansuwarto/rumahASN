import { cekPertekByNomerPeserta } from "@/controller/siasn-pengadaan.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .use(siasnMiddleware)
  .post(cekPertekByNomerPeserta);

export default router.handler();
