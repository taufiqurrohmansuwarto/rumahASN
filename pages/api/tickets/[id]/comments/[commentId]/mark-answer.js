import {
  markAsAnswer,
  unMarkAsAnswer,
} from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).put(markAsAnswer).delete(unMarkAsAnswer);

module.exports = router.handler({});
