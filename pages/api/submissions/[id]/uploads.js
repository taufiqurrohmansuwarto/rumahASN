import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();
import multer from "multer";

export const config = {
  api: {
    bodyParser: false,
  },
};

router.use(auth).use(multer().single("file")).post();

export default router.handler({});
