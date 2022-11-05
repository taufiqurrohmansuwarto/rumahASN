import multer from "multer";
import { createRouter } from "next-connect";
import { upload } from "../../controller/file.controller";
import auth from "../../middleware/auth.middleware";

// add setting to import images
export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const router = createRouter();

router.use(auth).post(multer().single("image"), upload);

export default router.handler({});
