import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { deleteNotification } from "@/controller/knowledge/knowledge-user-notifications.controller";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).delete(deleteNotification);

export default router.handler({});
