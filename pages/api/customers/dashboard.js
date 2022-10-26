import { createRouter } from "next-connect";
import { customerDashboard } from "../../../controller/dashboard.controller";
import auth from "../../../middleware/auth.middleware";
const router = createRouter();

router.use(auth).get(customerDashboard);

export default router.handler({});
