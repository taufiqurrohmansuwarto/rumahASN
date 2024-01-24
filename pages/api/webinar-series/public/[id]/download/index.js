import { checkWebinarCertificates } from "@/controller/certificate.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(checkWebinarCertificates);

export default router.handler();
