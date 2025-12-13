import { uploadVoiceMessage } from "@/controller/rasn-chat.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import multer from "multer";
import { createRouter } from "next-connect";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for voice
  },
});

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .post(upload.single("voice"), uploadVoiceMessage);

export default router.handler({});
