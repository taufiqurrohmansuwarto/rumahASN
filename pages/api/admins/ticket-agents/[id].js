import { createRouter } from "next-connect";
import {
  addAgents,
  removeAgents,
} from "../../../../controller/admin-ticket-agent.controller";
import auth from "../../../../middleware/auth.middleware";

const router = createRouter();

// add agents to tickets by id
router.use(auth).patch(addAgents).delete(removeAgents);

export default router.handler();
