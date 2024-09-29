import { checkIn, findCheckIn } from "@/controller/guests-books.controller";
import agentAdminMiddleware from "@/middleware/agent-admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(agentAdminMiddleware).post(checkIn).get(findCheckIn);

export default router.handler({});
