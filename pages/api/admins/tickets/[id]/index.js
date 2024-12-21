import { createRouter } from "next-connect";
import {
  addAgents,
  removeAgents,
  detail,
} from "@/controller/admin-ticket-agent.controller";
import auth from "@/middleware/auth.middleware";

const router = createRouter();
// patch for add assigne
// and delete for remove assignee
router.use(auth).get(detail).patch(addAgents).delete(removeAgents);

export default router.handler({});
