import { asnConnectReadNotification } from "@/controller/notifications.controller";
import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnFasilitatorMiddleware).put(asnConnectReadNotification);

export default router.handler();
