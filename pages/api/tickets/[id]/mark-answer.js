import {
  lockConversation,
  unLockConversation,
} from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// digunakan sebagai jawaban penentu di setiap ticket
router.use(auth).patch(lockConversation).delete(unLockConversation);

export default router.handler();
