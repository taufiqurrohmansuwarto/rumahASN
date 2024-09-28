import { getAllScheduleVisits } from "@/controller/guests-books.controller";
import agentAdminMiddleware from "@/middleware/agent-admin.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(agentAdminMiddleware).get(getAllScheduleVisits);

export default router.handler({});
