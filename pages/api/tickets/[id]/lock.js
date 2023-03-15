import {
  lockConversation,
  unLockConversation,
} from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).put(lockConversation).delete(unLockConversation);

export default router.handler();
