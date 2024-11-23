import {
  userThreadMessages,
  deleteThreadMessages,
} from "@/controller/chat-ai.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .get(userThreadMessages)
  .delete(deleteThreadMessages);

export default router.handler({});
