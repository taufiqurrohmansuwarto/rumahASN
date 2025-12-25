import { getMyCompletedTasks } from "@/controller/kanban/tasks.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getMyCompletedTasks);

export default router.handler({});

