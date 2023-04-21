import { ticketReminders } from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).post(ticketReminders);

export default router.handler();
