import {
  removeFilePodcast,
  uploadPodcast,
} from "@/controller/podcast.controller";
import auth from "@/middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";
import multer from "multer";
import { createRouter } from "next-connect";
const router = createRouter();

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

router
  .use(auth, checkRole("admin"))
  .post(multer().single("file"), uploadPodcast)
  .delete(removeFilePodcast);

export default router.handler();
