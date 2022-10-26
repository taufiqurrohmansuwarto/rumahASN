import { createRouter } from "next-connect";
import {
  remove,
  update,
} from "../../../../../../controller/tickets-comments-agents-to-agents";
import auth from "../../../../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).delete(remove).patch(update);

export default router.handler({});
