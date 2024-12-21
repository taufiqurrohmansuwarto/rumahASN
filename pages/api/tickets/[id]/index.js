import {
  detailPublishTickets,
  removeTicket,
  editTicket,
} from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();
router
  .use(auth)
  .get(detailPublishTickets)
  .delete(removeTicket)
  .patch(editTicket);

export default router.handler({});
