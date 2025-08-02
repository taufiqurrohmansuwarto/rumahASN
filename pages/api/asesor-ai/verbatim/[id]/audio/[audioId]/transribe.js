import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import {
  transribeAudioVerbatim,
  textToJson,
} from "@/controller/asesor-ai/verbatim.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .post(transribeAudioVerbatim)
  .patch(textToJson);

export default router.handler({});
