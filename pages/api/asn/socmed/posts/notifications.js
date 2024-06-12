import {
  asnConnectClearNotifications,
  asnConnectNotifications,
} from "@/controller/notifications.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .get(asnConnectNotifications)
  .delete(asnConnectClearNotifications);

export default router.handler();
