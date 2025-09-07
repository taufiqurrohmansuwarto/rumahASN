import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { getUserUnreadNotificationsCount } from "@/controller/knowledge/knowledge-user-notifications.controller";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getUserUnreadNotificationsCount);

export default router.handler({});
