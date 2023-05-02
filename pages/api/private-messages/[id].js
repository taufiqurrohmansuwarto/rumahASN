import {
  deletePrivateMessage,
  getPrivateMessage,
  readPrivateMessage,
} from "@/controller/private-messages.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .patch(readPrivateMessage)
  .delete(deletePrivateMessage)
  .get(getPrivateMessage);

export default router.handler({});
