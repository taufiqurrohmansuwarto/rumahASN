import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { index } from "@/controller/admin-ticket.controller";

const router = createRouter();
router.use(auth).get(index);

export default router.handler({});
