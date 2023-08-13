import { subscribeList } from "@/controller/subscribe_tickets.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(subscribeList);

export default router.handler();
