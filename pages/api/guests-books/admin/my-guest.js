import { myGuest } from "@/controller/guests-books.controller";
import agentAdminMiddleware from "@/middleware/agent-admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(agentAdminMiddleware).get(myGuest);

export default router.handler({});
