import { getChat } from "@/controller/chat-ai.controller";
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

router.post(getChat);

export default router.handler({});
