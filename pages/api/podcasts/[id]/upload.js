import { uploadPodcast } from "@/controller/podcast.controller";
import auth from "@/middleware/auth.middleware";
import multer from "multer";
import { createRouter } from "next-connect";
const router = createRouter();

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

router.use(auth).post(multer().single("file"), uploadPodcast);

export default router.handler();
