import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import multer from "multer";
import {
  getById as getLampiranById,
  update as updateLampiran,
  remove as deleteLampiran,
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

router
  .use(auth)
  .use(adminFasilitator)
  .get(getLampiranById)
  .patch(upload.single("file"), updateLampiran)
  .delete(deleteLampiran);

export default router.handler({});
