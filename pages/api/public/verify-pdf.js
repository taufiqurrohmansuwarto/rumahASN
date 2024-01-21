import { verifyPdfController } from "@/controller/esign.controller";
import { createRouter } from "next-connect";

const router = createRouter();
router.post(verifyPdfController);
export default router.handler({});
