import { agentsPerformances } from "@/controller/analysis.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(agentsPerformances);

export default router.handler();
