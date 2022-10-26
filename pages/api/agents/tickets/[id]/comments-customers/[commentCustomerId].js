import { createRouter } from "next-connect";
import auth from "../../../../../../middleware/auth.middleware";
import {
  detail,
  update,
  remove,
} from "../../../../../../controller/tickets-comments-customers-to-agents.controller";

const router = createRouter();

router.use(auth).get(detail).patch(update).delete(remove);

export default router.handler();
