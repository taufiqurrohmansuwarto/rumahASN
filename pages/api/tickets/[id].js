const {
  detailPublishTickets,
} = require("@/controller/tickets-props.controller");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();
router.use(auth).get(detailPublishTickets);

module.exports = router.handler({});
