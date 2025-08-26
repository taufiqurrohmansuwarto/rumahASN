import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import { getUserGamificationSummary } from "@/controller/knowledge/gamification.controller";

const router = createRouter();

router.use(auth).use(asnPemprovMiddleware).get(getUserGamificationSummary);

export default router.handler({});
