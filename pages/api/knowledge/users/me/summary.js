import { getUserGamificationSummary } from "@/controller/knowledge/gamification.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getUserGamificationSummary);

export default router.handler({});
