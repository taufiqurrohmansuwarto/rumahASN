import { createPostNetralitas } from "@/controller/netralitas.controller";
import { createRouter } from "next-connect";

import multer from "multer";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const router = createRouter();

router.post(multer().array("files", 3), createPostNetralitas);

export default router.handler();
