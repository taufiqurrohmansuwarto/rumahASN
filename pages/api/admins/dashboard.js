import { createRouter } from "next-connect";
import { adminDashboard } from "../../../controller/dashboard.controller";
const router = createRouter();
import auth from "@/middleware/auth.middleware";

router.use(auth).get(adminDashboard);

export default router.handler({});
