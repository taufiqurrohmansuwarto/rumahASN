import { refJabatanPelaksanaSiasn } from "@/controller/ref-siasn.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router
  //   .use(auth)
  //   .use(adminFasilitatorAsnMiddleware)
  //   .use(siasnMiddleware)
  .get(refJabatanPelaksanaSiasn);

export default router.handler();
