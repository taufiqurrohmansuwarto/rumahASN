import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import multer from "multer";
import { uploadDokumen } from "@/controller/perencanaan/formasi_usulan.controller";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitator)
  .post(upload.single("file"), uploadDokumen);

export default router.handler({});
