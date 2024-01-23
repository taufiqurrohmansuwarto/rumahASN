import { verifyPdfController } from "@/controller/esign.controller";
import { createRouter } from "next-connect";

// maximum request body size 50mb
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const router = createRouter();
router.post(verifyPdfController);
export default router.handler({});
