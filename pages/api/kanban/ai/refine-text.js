import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { refineText } from "@/controller/kanban/ai.controller";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).post(refineText);

export default router.handler();

