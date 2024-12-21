import { update } from "@/controller/admin-ticket.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();
// patch for add assigne
// and delete for remove assignee
router.use(auth).patch(update);

export default router.handler({});
