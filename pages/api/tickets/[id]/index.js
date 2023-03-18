const {
  detailPublishTickets,
  removeTicket,
} = require("@/controller/tickets-props.controller");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();
router.use(auth).get(detailPublishTickets).delete(removeTicket);

module.exports = router.handler({});
