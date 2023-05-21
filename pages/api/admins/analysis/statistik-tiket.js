import { ticketStatistics } from "@/controller/analysis.controller";
import auth from "@/middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth, checkRole("admin")).get(ticketStatistics);

export default router.handler({});
