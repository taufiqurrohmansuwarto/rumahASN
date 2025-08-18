import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import { userBadges } from "@/controller/knowledge/gamification.controller";

const router = createRouter();

router.use(auth).get(asnPemprovMiddleware).get(userBadges);

export default router.handler({});
