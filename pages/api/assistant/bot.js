import { handleChat } from "@/controller/bot-assistant.controller";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

const router = createRouter();

router.use(auth).post(async (req, res) => await handleChat(req, res));

export default router.handler({});
