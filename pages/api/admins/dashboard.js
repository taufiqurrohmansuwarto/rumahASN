import { createRouter } from "next-connect";
import { adminDashboard } from "../../../controller/dashboard.controller";
import auth from "../../../middleware/auth.middleware";
const router = createRouter();

router.use(auth).get(adminDashboard);

export default router.handler({});
