import { createRouter } from "next-connect";
import { update } from "../../../../../controller/agent-ticket.controller";
import auth from "../../../../../middleware/auth.middleware";

const router = createRouter();

// terima dan tidak terima
router.use(auth).patch(update);

export default router.handler();
