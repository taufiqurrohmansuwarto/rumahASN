import { createRouter } from "next-connect";
import { index } from "@/controller/tickets-comments-customers-to-agents.controller";
import auth from "@/middleware/auth.middleware";

const router = createRouter();
// patch for add assigne
// and delete for remove assignee
router.use(auth).get(index);

export default router.handler({});
