import { downloadCertificate } from "@/controller/webinar-series.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(downloadCertificate);

export default router.handler({});
