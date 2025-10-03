import { createRouter } from "next-connect";
import { verifyPdfController } from "@/controller/esign/esign.controller";

const router = createRouter();

router.get(verifyPdfController);

export default router.handler();
