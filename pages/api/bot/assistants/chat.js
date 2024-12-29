import { handleChat } from "@/controller/bot-assistant.controller";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
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
  .use(siasnMiddleware)
  .use(asnPemprovMiddleware)
  .post(async (req, res) => await handleChat(req, res));

export default router.handler({});
