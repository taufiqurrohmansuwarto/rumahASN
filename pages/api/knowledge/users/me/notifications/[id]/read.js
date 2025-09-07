import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { markNotificationAsRead } from "@/controller/knowledge/knowledge-user-notifications.controller";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).put(markNotificationAsRead);

export default router.handler({});
