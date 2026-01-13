import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import multer from "multer";
import {
  getAll as getAllLampiran,
  upload as uploadLampiran,
} from "@/controller/perencanaan/lampiran.controller";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = createRouter();

router.use(auth).use(adminFasilitator).get(getAllLampiran).post(upload.single("file"), uploadLampiran);

export default router.handler({});

