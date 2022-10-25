import { createRouter } from "next-connect";
import { index } from "../../../../controller/agent-ticket.controller";
import auth from "../../../../middleware/auth.middleware";

const router = createRouter();

// filter buat agents
router.use(auth).get(index);

export default router.handler();
