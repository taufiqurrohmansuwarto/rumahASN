import { changeFeedback } from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// only requester can give feedback
router.use(auth).patch(changeFeedback);

export default router.handler();
