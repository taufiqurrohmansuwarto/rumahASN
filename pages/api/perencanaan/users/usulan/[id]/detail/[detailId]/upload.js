import { uploadPerencanaanUsulanDetail } from "@/controller/perencanaan.controller";
import auth from "@/middleware/auth.middleware";
import fasilitatorMasterMiddleware from "@/middleware/fasilitator-master.middleware";
import { createRouter } from "next-connect";
const router = createRouter();
import multer from "multer";

export const config = {
  api: {
    bodyParser: false,
  },
};

router
  .use(auth)
  .use(fasilitatorMasterMiddleware)
  .put(multer().single("file"), uploadPerencanaanUsulanDetail);

export default router.handler();
