import {
  dataCertificateSignerByWebinarId,
  signCertificateByWebinarId,
} from "@/controller/webinar-certificates.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .get(dataCertificateSignerByWebinarId)
  .patch(signCertificateByWebinarId);

export default router.handler();
