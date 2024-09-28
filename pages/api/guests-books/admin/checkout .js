import { checkOut } from "@/controller/guests-books.controller";
import agentAdminMiddleware from "@/middleware/agent-admin.middleware";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).use(agentAdminMiddleware).post(checkOut);

export default router.handler({});
