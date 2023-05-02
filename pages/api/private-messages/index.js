import {
  findPrivateMessages,
  sendPrivateMessage,
} from "@/controller/private-messages.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(findPrivateMessages).post(sendPrivateMessage);

export default router.handler({});
