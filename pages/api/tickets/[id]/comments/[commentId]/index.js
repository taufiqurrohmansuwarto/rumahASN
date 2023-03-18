import {
  updateComments,
  removeComments,
} from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).patch(updateComments).delete(removeComments);

module.exports = router.handler({});
