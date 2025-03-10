import { handleChat } from "@/controller/bot-assistant.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .post(async (req, res) => await handleChat(req, res));

export default router.handler({});
