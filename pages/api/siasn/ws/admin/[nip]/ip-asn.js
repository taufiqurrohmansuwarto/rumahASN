import { getIpAsnByNip } from "@/controller/siasn-pengembangan-kompentensi.controller";
import auth from "@/middleware/auth.middleware";
import downloadMiddleware from "@/middleware/download.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(downloadMiddleware)
  .use(siasnMiddleware)
  .get(getIpAsnByNip);

export default router.handler();
