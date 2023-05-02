import { ticketRecommendations } from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(ticketRecommendations);

export default router.handler({});
