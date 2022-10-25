import { createRouter } from "next-connect";
import { index } from "../../../../../../controller/tickets-comments-agents-to-agents";
import auth from "../../../../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(index);

export default router.handler();
