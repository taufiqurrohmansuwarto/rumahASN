import { pinnedTickets } from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(pinnedTickets);

module.exports = router.handler({});
