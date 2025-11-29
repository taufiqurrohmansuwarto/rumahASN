import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import {
  getNotifications,
  markNotificationRead,
} from "@/controller/sapa-asn/users/dashboard.controller";

const router = createRouter();

router.use(auth).use(asnMiddleware).get(getNotifications).patch(markNotificationRead);

export default router.handler();

