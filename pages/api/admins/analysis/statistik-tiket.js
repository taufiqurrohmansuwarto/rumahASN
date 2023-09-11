import { ticketStatistics } from "@/controller/analysis.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(ticketStatistics);

export default router.handler({});
