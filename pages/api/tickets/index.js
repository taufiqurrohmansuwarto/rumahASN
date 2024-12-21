const { publishedTickets } = require("@/controller/tickets-props.controller");
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(publishedTickets);

export default router.handler({});
