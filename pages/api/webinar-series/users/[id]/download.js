import { downloadCertificate } from "@/controller/webinar-series.controller";
import auth from "@/middleware/auth.middleware";
import esignSegelOtpSealMiddleware from "@/middleware/esign-segel-otp-seal.middleware";
import webinarUserTypeMiddleware from "@/middleware/webinar-user-type.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(webinarUserTypeMiddleware)
  .use(esignSegelOtpSealMiddleware)
  .get(downloadCertificate);

export default router.handler({});
