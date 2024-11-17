const {
  detailPublishTickets,
  removeTicket,
  editTicket,
} = require("@/controller/tickets-props.controller");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();
router
  .use(auth)
  .get(detailPublishTickets)
  .delete(removeTicket)
  .patch(editTicket);

export default router.handler({});
