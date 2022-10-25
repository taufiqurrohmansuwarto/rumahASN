import { createRouter } from "next-connect";
import auth from "../../../../../../middleware/auth.middleware";
import {
  hapusTicket,
  kerjakanTicket,
} from "../../../../../controller/agent-ticket.controller";

const router = createRouter();

// terima dan tidak terima
router.use(auth).patch(kerjakanTicket).remove(hapusTicket);

export default router.handler();
