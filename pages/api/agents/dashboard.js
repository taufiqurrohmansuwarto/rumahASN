import { createRouter } from "next-connect";
import { agentDashboard } from "../../../controller/dashboard.controller";
import auth from "../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(agentDashboard);

export default router.handler({});
