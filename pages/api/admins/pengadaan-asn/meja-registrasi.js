import {
  batchInsertMejaRegistrasi,
  findAllMejaRegistrasi,
} from "@/controller/meja-registrasi.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import multer from "multer";
import { createRouter } from "next-connect";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .post(multer().single("file"), batchInsertMejaRegistrasi)
  .get(findAllMejaRegistrasi);

export default router.handler({});
