import { getChat } from "@/controller/chat-ai.controller";
import { createRouter } from "next-connect";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
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

router.use(auth).use(auth).use(asnNonAsnFasilitatorMiddleware).post(getChat);

export default router.handler({});
