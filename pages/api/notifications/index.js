import { createRouter } from "next-connect";
import {
  clearChats,
  index,
} from "../../../controller/notifications.controller";
import auth from "../../../middleware/auth.middleware";
const router = createRouter();

router.use(auth).get(index).put(clearChats);

export default router.handler();
