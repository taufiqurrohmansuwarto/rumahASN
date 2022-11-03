import { createRouter } from "next-connect";
import {
  create,
  index,
} from "../../../../../../controller/tickets-comments-customers-to-agents.controller";
import auth from "../../../../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).post(create).get(index);

export default router.handler();
