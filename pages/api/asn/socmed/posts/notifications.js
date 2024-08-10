import {
  asnConnectClearNotifications,
  asnConnectNotifications,
} from "@/controller/notifications.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .get(asnConnectNotifications)
  .delete(asnConnectClearNotifications);

export default router.handler();
